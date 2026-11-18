import { test, expect } from 'bun:test';
import {
  calculateSmartSizeRecommendation,
  cmToFeetInches,
  feetInchesToCm,
  kgToLbs,
} from '../src/utils/sizeFinder.ts';

test('unit helpers convert metric and imperial measurements accurately', () => {
  expect(cmToFeetInches(173)).toEqual({ feet: 5, inches: 8 });
  expect(feetInchesToCm(5, 8)).toBe(173);
  expect(kgToLbs(68)).toBe(150);
});

test('fit preference (Slim -> Regular -> Oversized) increases or preserves recommended garment sizes', () => {
  const sizeOrder = ['M', 'L', 'XL', 'XXL'];
  const kameeOrder = ['36 (S)', '38 (M)', '40 (L)', '42 (XL)', '44 (XXL)'];

  const slim = calculateSmartSizeRecommendation({
    heightCm: 170,
    weightKg: 66,
    fitPreference: 'slim',
  });
  const regular = calculateSmartSizeRecommendation({
    heightCm: 170,
    weightKg: 66,
    fitPreference: 'regular',
  });
  const oversized = calculateSmartSizeRecommendation({
    heightCm: 170,
    weightKg: 66,
    fitPreference: 'oversized',
  });

  expect(sizeOrder.indexOf(slim.starkit.size)).toBeLessThanOrEqual(
    sizeOrder.indexOf(regular.starkit.size)
  );
  expect(sizeOrder.indexOf(regular.starkit.size)).toBeLessThanOrEqual(
    sizeOrder.indexOf(oversized.starkit.size)
  );

  expect(kameeOrder.indexOf(slim.fariza.kameezSize)).toBeLessThanOrEqual(
    kameeOrder.indexOf(regular.fariza.kameezSize)
  );
  expect(kameeOrder.indexOf(regular.fariza.kameezSize)).toBeLessThanOrEqual(
    kameeOrder.indexOf(oversized.fariza.kameezSize)
  );
});

test('petite slim frames map cleanly to M hoodie and 36 (S) Fariza Kameez', () => {
  const rec = calculateSmartSizeRecommendation({
    heightCm: 155,
    weightKg: 48,
    fitPreference: 'slim',
  });

  expect(rec.starkit.size).toBe('M');
  expect(rec.fariza.kameezSize).toBe('36 (S)');
  expect(rec.fariza.chestOption).toBe('36"');
  expect(rec.fariza.unstitchedNoteEn).toContain('2.75 yd');
});

test('tall or heavier frames receive proper XXL / 44 (XXL) clearance', () => {
  const rec = calculateSmartSizeRecommendation({
    heightCm: 188,
    weightKg: 108,
    fitPreference: 'oversized',
  });

  expect(rec.starkit.size).toBe('XXL');
  expect(rec.fariza.kameezSize).toBe('44 (XXL)');
  expect(rec.fariza.chestOption).toBe('44"');
});

test('manual chest override supersedes height/weight chest estimation', () => {
  const rec = calculateSmartSizeRecommendation({
    heightCm: 165,
    weightKg: 58,
    fitPreference: 'regular',
    chestInchesOverride: 44,
  });

  expect(rec.estimatedBodyChestInches).toBe(44);
  expect(rec.starkit.size).toBe('XXL');
  expect(rec.fariza.kameezSize).toBe('44 (XXL)');
});
