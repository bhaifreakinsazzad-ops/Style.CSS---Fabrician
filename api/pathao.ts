interface PathaoRequest {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
}

interface PathaoResponse {
  status: (code: number) => PathaoResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
}

interface CachedToken {
  accessToken: string;
  expiresAtMs: number;
}

let cachedToken: CachedToken | null = null;

function resolvePathaoEnv() {
  const baseUrl = (
    process.env.Pathao_Merchant_log_in_base_url ||
    process.env.PATHAO_MERCHANT_BASE_URL ||
    process.env.PATHAO_BASE_URL ||
    'https://api-hermes.pathao.com'
  )
    .trim()
    .replace(/\/+$/, '');

  const clientId = (
    process.env.Pathao_Merchant_log_in_Client_ID ||
    process.env.PATHAO_MERCHANT_CLIENT_ID ||
    process.env.PATHAO_CLIENT_ID ||
    ''
  ).trim();

  const clientSecret = (
    process.env.Pathao_Merchant_log_in_Client_Secret ||
    process.env.PATHAO_MERCHANT_CLIENT_SECRET ||
    process.env.PATHAO_CLIENT_SECRET ||
    ''
  ).trim();

  const username = (
    process.env.PATHAO_MERCHANT_USERNAME ||
    process.env.PATHAO_USERNAME ||
    ''
  ).trim();

  const password = (
    process.env.PATHAO_MERCHANT_PASSWORD ||
    process.env.PATHAO_PASSWORD ||
    ''
  ).trim();

  const directToken = (process.env.PATHAO_ACCESS_TOKEN || '').trim();

  return {
    baseUrl,
    clientId,
    clientSecret,
    username,
    password,
    directToken,
  };
}

async function resolveBearerToken(): Promise<string | null> {
  const env = resolvePathaoEnv();
  if (env.directToken) {
    return env.directToken;
  }

  if (cachedToken && Date.now() < cachedToken.expiresAtMs - 60_000) {
    return cachedToken.accessToken;
  }

  if (!env.clientId || !env.clientSecret) {
    return null;
  }

  const issuePayload: Record<string, string> = {
    client_id: env.clientId,
    client_secret: env.clientSecret,
    grant_type: env.username && env.password ? 'password' : 'client_credentials',
  };

  if (env.username && env.password) {
    issuePayload.username = env.username;
    issuePayload.password = env.password;
  }

  try {
    const tokenRes = await fetch(`${env.baseUrl}/aladdin/api/v1/issue-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(issuePayload),
      signal: AbortSignal.timeout(8000),
    });

    if (!tokenRes.ok) {
      return null;
    }

    const tokenJson = (await tokenRes.json().catch(() => null)) as {
      access_token?: string;
      expires_in?: number;
    } | null;

    if (!tokenJson?.access_token) {
      return null;
    }

    const ttlMs =
      typeof tokenJson.expires_in === 'number' && tokenJson.expires_in > 120
        ? tokenJson.expires_in * 1000
        : 3600 * 1000;

    cachedToken = {
      accessToken: tokenJson.access_token,
      expiresAtMs: Date.now() + ttlMs,
    };

    return tokenJson.access_token;
  } catch {
    return null;
  }
}

export default async function handler(req: PathaoRequest, res: PathaoResponse): Promise<void> {
  res.setHeader('Cache-Control', 'no-store');
  const env = resolvePathaoEnv();

  if (req.method === 'GET') {
    res.status(200).json({
      ok: true,
      configured: Boolean(env.clientId && env.clientSecret),
      baseUrl: env.baseUrl,
      hasMerchantLogin: Boolean(env.username && env.password),
      hasAccessToken: Boolean(env.directToken),
    });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  let body: { action?: string; consignmentId?: string } = {};
  try {
    if (typeof req.body === 'string') {
      body = req.body ? (JSON.parse(req.body) as { action?: string; consignmentId?: string }) : {};
    } else if (req.body && typeof req.body === 'object') {
      body = req.body as { action?: string; consignmentId?: string };
    }
  } catch {
    res.status(400).json({ ok: false, error: 'Invalid JSON payload' });
    return;
  }

  const consignmentId = (body.consignmentId || '').trim();
  if (!/^[A-Za-z0-9_-]{3,64}$/.test(consignmentId)) {
    res.status(400).json({ ok: false, error: 'Invalid consignment or order ID format' });
    return;
  }

  const headerTokenRaw = req.headers['x-pathao-token'];
  const overrideToken =
    typeof headerTokenRaw === 'string' ? headerTokenRaw.trim() : '';
  const token = overrideToken || (await resolveBearerToken());
  if (!token) {
    res.status(202).json({
      ok: false,
      skipped: true,
      reason: 'Pathao Merchant OAuth token unavailable',
    });
    return;
  }

  try {
    const infoRes = await fetch(
      `${env.baseUrl}/aladdin/api/v1/orders/${encodeURIComponent(consignmentId)}/info`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(8000),
      }
    );

    if (!infoRes.ok) {
      res.status(202).json({
        ok: false,
        skipped: true,
        status: infoRes.status,
      });
      return;
    }

    const infoJson = (await infoRes.json().catch(() => null)) as Record<string, unknown> | null;
    if (!infoJson || typeof infoJson !== 'object') {
      res.status(202).json({ ok: false, skipped: true });
      return;
    }

    res.status(200).json({
      ok: true,
      data: (infoJson as { data?: unknown }).data ?? infoJson,
    });
  } catch {
    res.status(202).json({ ok: false, skipped: true });
  }
}
