import { test, expect } from 'bun:test';
import checkout from '../api/checkout.ts';
import orderStatus from '../api/order-status.ts';
import catalog from '../api/catalog.ts';

async function invoke(handler, method='GET', body) {
  const headers = {};
  const request = {
    method, headers, body,
    async *[Symbol.asyncIterator]() {
      yield Buffer.from(JSON.stringify(body || {}));
    },
  };
  const response = {
    statusCode: 200,
    body: '',
    headers: {},
    setHeader(key, value) { this.headers[key.toLowerCase()] = value; },
    end(text) { this.body = String(text || ''); return this; },
  };
  await handler(request, response);
  return { status: response.statusCode, data: JSON.parse(response.body) };
}

test('checkout only supports POST', async () => {
  const r = await invoke(checkout);
  expect(r.status).toBe(405);
  expect(r.data.error).toBe('METHOD_NOT_ALLOWED');
});

test('tracking only supports POST', async () => {
  const r = await invoke(orderStatus);
  expect(r.status).toBe(405);
  expect(r.data.error).toBe('METHOD_NOT_ALLOWED');
});

test('catalog only supports GET', async () => {
  const r = await invoke(catalog, 'POST');
  expect(r.status).toBe(405);
  expect(r.data.error).toBe('METHOD_NOT_ALLOWED');
});

test('checkout fails closed without private database configuration', async () => {
  const savedUrl = process.env.SUPABASE_URL, savedKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  try {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const r = await invoke(checkout, 'POST', { items: [], customer: {} });
    expect(r.status).toBe(503);
    expect(r.data.error).toBe('CHECKOUT_NOT_CONFIGURED');
  } finally {
    if (savedUrl !== undefined) process.env.SUPABASE_URL = savedUrl;
    if (savedKey !== undefined) process.env.SUPABASE_SERVICE_ROLE_KEY = savedKey;
  }
});

test('tracking fails closed without private database configuration', async () => {
  const savedUrl = process.env.SUPABASE_URL, savedKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  try {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const r = await invoke(orderStatus, 'POST', { orderId: 'FAB-12345678', lookupToken: 'x'.repeat(50) });
    expect(r.status).toBe(503);
    expect(r.data.error).toBe('NOT_CONFIGURED');
  } finally {
    if (savedUrl !== undefined) process.env.SUPABASE_URL = savedUrl;
    if (savedKey !== undefined) process.env.SUPABASE_SERVICE_ROLE_KEY = savedKey;
  }
});

test('catalog fails closed without private database configuration', async () => {
  const savedUrl = process.env.SUPABASE_URL, savedKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  try {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const r = await invoke(catalog);
    expect(r.status).toBe(503);
    expect(r.data.error).toBe('CATALOG_NOT_CONFIGURED');
  } finally {
    if (savedUrl !== undefined) process.env.SUPABASE_URL = savedUrl;
    if (savedKey !== undefined) process.env.SUPABASE_SERVICE_ROLE_KEY = savedKey;
  }
});
