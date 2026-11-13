import type { IncomingMessage, ServerResponse } from 'node:http';

type Request = IncomingMessage & { body?: unknown };
type Item = { sku: string; quantity: number };
function send(res: ServerResponse, code: number, body: unknown) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}
async function readJson(req: Request): Promise<unknown> {
  if (req.body && typeof req.body === 'object') return req.body;
  let raw = '';
  for await (const chunk of req) {
    raw += Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk);
    if (raw.length > 12000) throw new Error('PAYLOAD_TOO_LARGE');
  }
  return JSON.parse(raw || '{}');
}
export default async function handler(req: Request, res: ServerResponse) {
  if (req.method !== 'POST') return send(res, 405, { error: 'METHOD_NOT_ALLOWED' });
  const origin = req.headers.origin;
  if (origin) {
    try { if (new URL(origin).host !== req.headers.host) return send(res, 403, { error: 'ORIGIN_NOT_ALLOWED' }); }
    catch { return send(res, 403, { error: 'ORIGIN_NOT_ALLOWED' }); }
  }
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return send(res, 503, { error: 'CHECKOUT_NOT_CONFIGURED' });
  try {
    const payload = await readJson(req) as {
      requestId?: string; lookupToken?: string; items?: Item[];
      customer?: { name?: string; phone?: string; address?: string; division?: string };
    };
    if (!payload || typeof payload.requestId !== 'string' ||
        typeof payload.lookupToken !== 'string' ||
        !Array.isArray(payload.items) || payload.items.length < 1 || payload.items.length > 25 ||
        !payload.items.every(x => /^[A-Za-z0-9_-]{3,100}$/.test(x.sku) &&
          Number.isInteger(x.quantity) && x.quantity >= 1 && x.quantity <= 20) ||
        !Number.isSafeInteger((payload as { expectedTotalBDT?: number }).expectedTotalBDT) ||
        !payload.customer || !['name','phone','address','division'].every(k =>
          typeof (payload.customer as Record<string,unknown>)[k] === 'string')) {
      return send(res, 400, { error: 'INVALID_CHECKOUT' });
    }
    const response = await fetch(`${url.replace(/\/$/,'')}/rest/v1/rpc/fabrician_checkout`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_payload: payload }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      const detail = await response.text();
      const code = ['INSUFFICIENT_STOCK','PRODUCT_NOT_PUBLISHED','ORDER_RATE_LIMITED','REUSED_REQUEST_KEY','PRICE_CHANGED','PROMO_NOT_ELIGIBLE']
        .find(c => detail.includes(c));
      return send(res, code === 'ORDER_RATE_LIMITED' ? 429 : code ? 409 : 503,
        { error: code || 'ORDER_UNAVAILABLE' });
    }
    const result = await response.json() as { orderId: string; totalBDT?: number; status: string; consignmentId?: string|null };
    if (typeof result?.orderId !== 'string') throw new Error('INVALID_BACKEND_RESPONSE');
    return send(res, 201, { ...result, lookupToken: payload.lookupToken });
  } catch {
    return send(res, 503, { error: 'CHECKOUT_UNAVAILABLE' });
  }
}
