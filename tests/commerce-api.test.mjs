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

test('checkout rejects invalid optional areaUpazila / deliveryNotes types when configured', async () => {
  const savedUrl = process.env.SUPABASE_URL, savedKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  try {
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
    const r = await invoke(checkout, 'POST', {
      requestId: 'req_12345678901234567890',
      lookupToken: 'tok_'.padEnd(40, 'x'),
      expectedTotalBDT: 1470,
      items: [{ sku: 'FAB-H001-BLK-M', quantity: 1 }],
      customer: {
        name: 'Nusrat Jahan',
        phone: '01711111111',
        address: 'House 10 Road 11 Banani',
        division: 'Dhaka, Dhaka Division',
        areaUpazila: 12345,
      },
    });
    expect(r.status).toBe(400);
    expect(r.data.error).toBe('INVALID_CHECKOUT');
  } finally {
    if (savedUrl !== undefined) process.env.SUPABASE_URL = savedUrl;
    else delete process.env.SUPABASE_URL;
    if (savedKey !== undefined) process.env.SUPABASE_SERVICE_ROLE_KEY = savedKey;
    else delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  }
});
