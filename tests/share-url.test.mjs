import { test, expect } from 'bun:test';
import {
  buildFacebookShareHref,
  buildProductShareUrl,
  buildStarKiTDesignShareUrl,
  buildWhatsAppShareHref,
} from '../src/utils/shareUrl.ts';

test('StarkiT product share URLs resolve to canonical /starkit/product/:designId paths', () => {
  expect(
    buildStarKiTDesignShareUrl('STK-H003')
  ).toEndWith('/starkit/product/STK-H003');

  expect(
    buildProductShareUrl(
      {
        id: 'starkit-folk-art-bus',
        slug: 'folk-art-bus',
        brand: 'StarKiT',
        category: 'Streetwear',
      },
      'STK-H003-BLK'
    )
  ).toEndWith('/starkit/product/STK-H003');
});

test("Fariza's Territory and storefront products resolve to clean deep-link share URLs", () => {
  expect(
    buildProductShareUrl({
      id: 'tp-cat-001',
      slug: 'cat-001',
      brand: "Fariza's Territory",
      category: 'Women',
    })
  ).toEndWith('/farizas-territory?product=cat-001');

  expect(
    buildProductShareUrl({
      id: 'ess-1',
      slug: 'panjabi-ivory',
      brand: 'FABRICIAN',
      category: 'Men',
    })
  ).toEndWith('/?product=panjabi-ivory');
});

test('WhatsApp and Facebook share links properly encode text and target URLs without window.open dependencies', () => {
  const waHref = buildWhatsAppShareHref(
    'StarkiT Folk Art Bus',
    'https://fabrician.bd/starkit/product/STK-H003',
    '৳1,650 · Drop 01'
  );
  expect(waHref).toStartWith('https://wa.me/?text=');
  expect(waHref).toContain(encodeURIComponent('https://fabrician.bd/starkit/product/STK-H003'));

  const fbHref = buildFacebookShareHref(
    'https://fabrician.bd/starkit/product/STK-H003',
    'StarkiT Folk Art Bus'
  );
  expect(fbHref).toStartWith('https://www.facebook.com/sharer/sharer.php?');
  expect(fbHref).toContain('u=https%3A%2F%2Ffabrician.bd%2Fstarkit%2Fproduct%2FSTK-H003');
});
