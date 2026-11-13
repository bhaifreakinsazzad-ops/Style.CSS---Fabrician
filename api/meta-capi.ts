import crypto from 'node:crypto';

interface CapiRequest {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
  socket?: { remoteAddress?: string };
}

interface CapiResponse {
  status: (code: number) => CapiResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
}

interface CapiContentEntry {
  id: string;
  quantity: number;
  item_price: number;
}

interface CapiRequestBody {
  eventName?: string;
  eventId?: string;
  eventSourceUrl?: string;
  fbp?: string;
  fbc?: string;
  customData?: {
    currency?: string;
    value?: number;
    order_id?: string;
    content_type?: string;
    content_ids?: string[];
    content_name?: string;
    content_category?: string;
    contents?: CapiContentEntry[];
    num_items?: number;
    search_string?: string;
    payment_type?: string;
  };
  customer?: {
    fullName?: string;
    phone?: string;
    division?: string;
  };
}

const ALLOWED_EVENTS = new Set([
  'PageView',
  'ViewContent',
  'Search',
  'AddToWishlist',
  'AddToCart',
  'InitiateCheckout',
  'AddPaymentInfo',
  'Purchase',
  'Contact',
  'CustomizeProduct',
]);

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function normalizeAndHashPhone(rawPhone?: string): string | undefined {
  if (!rawPhone) return undefined;
  let digits = rawPhone.replace(/\D/g, '');
  if (!digits) return undefined;
  if (digits.startsWith('01') && digits.length === 11) {
    digits = `88${digits}`;
  } else if (digits.startsWith('1') && digits.length === 10) {
    digits = `880${digits}`;
  }
  if (digits.length < 10) return undefined;
  return sha256(digits);
}

function normalizeAndHashName(fullName?: string): { fn?: string; ln?: string } {
  const cleaned = (fullName || '').trim().toLowerCase().replace(/\s+/g, ' ');
  if (!cleaned) return {};
  const parts = cleaned.split(' ');
  const fn = parts[0] ? sha256(parts[0]) : undefined;
  const last = parts.length > 1 ? parts.slice(1).join(' ') : undefined;
  const ln = last ? sha256(last) : undefined;
  return { fn, ln };
}

function normalizeAndHashCity(division?: string): string | undefined {
  if (!division) return undefined;
  const city = division
    .toLowerCase()
    .replace(/\bdivision\b/gi, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
  return city ? sha256(city) : undefined;
}

function getHeader(
  headers: Record<string, string | string[] | undefined>,
  name: string
): string | undefined {
  const direct = headers[name] ?? headers[name.toLowerCase()];
  if (Array.isArray(direct)) return direct[0];
  return direct;
}

function resolveClientIp(req: CapiRequest): string | undefined {
  const forwarded = getHeader(req.headers, 'x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = getHeader(req.headers, 'x-real-ip');
  if (realIp) return realIp.trim();
  return req.socket?.remoteAddress;
}

function resolveAccessToken(): string {
  return (
    process.env.META_CAPI_ACCESS_TOKEN ||
    process.env.META_PIXEL_ACCESS_TOKEN ||
    process.env.META_ACCESS_TOKEN ||
    process.env.FB_CAPI_ACCESS_TOKEN ||
    process.env.FACEBOOK_CAPI_ACCESS_TOKEN ||
    process.env.FACEBOOK_ACCESS_TOKEN ||
    ''
  ).trim();
}

export default async function handler(req: CapiRequest, res: CapiResponse): Promise<void> {
  res.setHeader('Cache-Control', 'no-store');

  const pixelId = (process.env.META_PIXEL_ID || '1390081606323661').trim();
  const accessToken = resolveAccessToken();
  const testEventCode = (process.env.META_TEST_EVENT_CODE || '').trim();

  if (req.method === 'GET') {
    res.status(200).json({
      ok: true,
      pixelId,
      capiConfigured: Boolean(accessToken),
      testMode: Boolean(testEventCode),
    });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  let body: CapiRequestBody = {};
  try {
    if (typeof req.body === 'string') {
      body = req.body ? (JSON.parse(req.body) as CapiRequestBody) : {};
    } else if (req.body && typeof req.body === 'object') {
      body = req.body as CapiRequestBody;
    }
  } catch {
    res.status(400).json({ ok: false, error: 'Invalid JSON payload' });
    return;
  }

  const eventName = (body.eventName || '').trim();
  if (!ALLOWED_EVENTS.has(eventName)) {
    res.status(400).json({ ok: false, error: 'Unsupported Meta CAPI eventName' });
    return;
  }

  if (!accessToken) {
    res.status(202).json({
      ok: false,
      skipped: true,
      reason: 'META_CAPI_ACCESS_TOKEN is not configured in environment',
    });
    return;
  }

  const clientIp = resolveClientIp(req);
  const userAgent = getHeader(req.headers, 'user-agent');
  const hashedPhone = normalizeAndHashPhone(body.customer?.phone);
  const { fn, ln } = normalizeAndHashName(body.customer?.fullName);
  const hashedCity = normalizeAndHashCity(body.customer?.division);

  const userData: Record<string, unknown> = {
    country: [sha256('bd')],
  };
  if (clientIp) userData.client_ip_address = clientIp;
  if (userAgent) userData.client_user_agent = userAgent;
  if (body.fbp) userData.fbp = body.fbp;
  if (body.fbc) userData.fbc = body.fbc;
  if (hashedPhone) userData.ph = [hashedPhone];
  if (fn) userData.fn = [fn];
  if (ln) userData.ln = [ln];
  if (hashedCity) userData.ct = [hashedCity];

  const eventPayload: Record<string, unknown> = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    action_source: 'website',
    user_data: userData,
  };

  if (body.eventId) eventPayload.event_id = body.eventId;
  if (body.eventSourceUrl) eventPayload.event_source_url = body.eventSourceUrl;
  if (body.customData && Object.keys(body.customData).length > 0) {
    eventPayload.custom_data = body.customData;
  }

  const graphPayload: Record<string, unknown> = {
    data: [eventPayload],
  };
  if (testEventCode) {
    graphPayload.test_event_code = testEventCode;
  }

  try {
    const endpoint = `https://graph.facebook.com/v21.0/${encodeURIComponent(
      pixelId
    )}/events?access_token=${encodeURIComponent(accessToken)}`;

    const metaResponse = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(graphPayload),
    });

    const metaJson = (await metaResponse.json().catch(() => ({}))) as Record<string, unknown>;

    if (!metaResponse.ok) {
      console.error('Meta CAPI request rejected:', metaResponse.status, metaJson);
      res.status(502).json({
        ok: false,
        status: metaResponse.status,
        error: metaJson,
      });
      return;
    }

    res.status(200).json({
      ok: true,
      eventName,
      eventId: body.eventId || null,
      eventsReceived: metaJson.events_received ?? 1,
      fbtraceId: metaJson.fbtrace_id ?? null,
    });
  } catch (err) {
    console.error('Meta CAPI dispatch failed:', err);
    res.status(500).json({ ok: false, error: 'Failed to reach Meta Conversions API' });
  }
}
