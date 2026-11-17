import { Product } from '../types';
import { findStarKiTDesign } from '../data/starkit44Catalog';

function getOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return 'https://fabrician.bd';
}

export function buildProductShareUrl(
  product: Pick<Product, 'id' | 'slug' | 'brand' | 'category'>,
  skuOrDesignId?: string
): string {
  const origin = getOrigin();
  const starKiTDesign =
    findStarKiTDesign(skuOrDesignId || '') ||
    findStarKiTDesign(product.id) ||
    findStarKiTDesign(product.slug);

  if (starKiTDesign) {
    return `${origin}/starkit/product/${encodeURIComponent(starKiTDesign.designId)}`;
  }

  const normalizedBrand = (product.brand || '').toLowerCase();
  const identifier = product.slug || product.id;

  if (normalizedBrand.includes('fariza')) {
    return `${origin}/farizas-territory?product=${encodeURIComponent(identifier)}`;
  }

  if (normalizedBrand.includes('starkit')) {
    return `${origin}/starkit?product=${encodeURIComponent(identifier)}`;
  }

  return `${origin}/?product=${encodeURIComponent(identifier)}`;
}

export function buildStarKiTDesignShareUrl(designId: string): string {
  const origin = getOrigin();
  const matched = findStarKiTDesign(designId);
  const canonical = matched ? matched.designId : designId;
  return `${origin}/starkit/product/${encodeURIComponent(canonical)}`;
}

export function buildWhatsAppShareHref(title: string, url: string, description?: string): string {
  const lines = [title];
  if (description) lines.push(description);
  lines.push(url);
  return `https://wa.me/?text=${encodeURIComponent(lines.join('\n'))}`;
}

export function buildFacebookShareHref(url: string, quote?: string): string {
  const params = new URLSearchParams({ u: url });
  if (quote) {
    params.set('quote', quote);
  }
  return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
}
