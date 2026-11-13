import type { IncomingMessage, ServerResponse } from 'node:http';

type PublicProduct = {
  id: string; brand: string; name_en: string; name_bn: string;
  category: string; description_en: string; image_url: string;
  status: string; rights_cleared: boolean;
};
type PublicVariant = {
  sku: string; product_id: string; color: string; size: string;
  price_bdt: number; stock_count: number; enabled: boolean;
};
type PublicSettings = {
  free_shipping_threshold_bdt: number; dhaka_shipping_bdt: number;
  outside_dhaka_shipping_bdt: number; bundle_2_discount_bdt: number;
  bundle_3_discount_bdt: number;
};

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=30');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'GET') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: 'METHOD_NOT_ALLOWED' }));
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || !/^https:\/\/[^/]+\.supabase\.co\/?$/.test(url)) {
    res.statusCode = 503;
    return res.end(JSON.stringify({ error: 'CATALOG_NOT_CONFIGURED' }));
  }
  const root = url.replace(/\/$/, '') + '/rest/v1';
  const headers = { apikey: key, Authorization: `Bearer ${key}` };
  try {
    async function getTable<T>(path: string): Promise<T[]> {
      const response = await fetch(root + path, {
        headers, signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) throw Error('CATALOG_READ_FAILED');
      return await response.json() as T[];
    }
    const [productRows, variantRows, settingsRows] = await Promise.all([
      getTable<PublicProduct>('/fabrician_products?select=id,brand,name_en,name_bn,category,description_en,image_url,status,rights_cleared&status=eq.active&rights_cleared=eq.true'),
      getTable<PublicVariant>('/fabrician_variants?select=sku,product_id,color,size,price_bdt,stock_count,enabled&enabled=eq.true'),
      getTable<PublicSettings>('/fabrician_settings?select=free_shipping_threshold_bdt,dhaka_shipping_bdt,outside_dhaka_shipping_bdt,bundle_2_discount_bdt,bundle_3_discount_bdt&id=eq.main'),
    ]);
    // Filter a second time in the API layer, so privileged service-role reads
    // never accidentally expose unpublished designs or disabled variants.
    const published = productRows.filter(p => p.status === 'active' && p.rights_cleared === true);
    const ids = new Set(published.map(p => p.id));
    const variants = variantRows.filter(v =>
      ids.has(v.product_id) && v.enabled === true &&
      Number.isInteger(v.price_bdt) && v.price_bdt > 0 &&
      Number.isInteger(v.stock_count) && v.stock_count >= 0
    );
    const byId = new Map<string, PublicVariant[]>();
    for (const variant of variants) {
      const entry = byId.get(variant.product_id) || [];
      entry.push(variant);
      byId.set(variant.product_id, entry);
    }
    const products = published.filter(p => byId.has(p.id)).map(p => ({
      id: p.id, brand: p.brand, nameEn: p.name_en, nameBn: p.name_bn,
      category: p.category, descriptionEn: p.description_en,
      image: p.image_url, status: 'active' as const,
      variants: byId.get(p.id),
    }));
    const settings = settingsRows[0];
    res.statusCode = 200;
    return res.end(JSON.stringify({ products, settings: settings ? {
      freeShippingThresholdBDT: settings.free_shipping_threshold_bdt,
      dhakaShippingFeeBDT: settings.dhaka_shipping_bdt,
      outsideDhakaShippingFeeBDT: settings.outside_dhaka_shipping_bdt,
      bundle2DiscountBDT: settings.bundle_2_discount_bdt,
      bundle3DiscountBDT: settings.bundle_3_discount_bdt,
    } : null }));
  } catch {
    res.statusCode = 503;
    res.setHeader('Cache-Control', 'no-store');
    return res.end(JSON.stringify({ error: 'CATALOG_UNAVAILABLE' }));
  }
}
