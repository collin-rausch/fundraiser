/**
 * Single continuous laboratory-thermometer silhouette.
 * Uniform stem → circular bulb (no taper along the neck).
 * viewBox: 0 0 100 496
 */
export const THERMO_VIEWBOX = { w: 100, h: 496 };
export const THERMO_CX = 50;

/** Stem 30–70 (25% wider than 34–66); bulb is one semicircular arc (r=42). */
export const THERMO_OUTLINE = `
  M 30 6
  C 30 1 70 1 70 6
  L 70 417
  A 42 42 0 1 1 30 417
  L 30 6
  Z
`;

/** y where uniform stem ends and bulb begins */
export const THERMO_STEM_BOTTOM_Y = 417;

export function meniscusRadiusAtY(y, vbH = THERMO_VIEWBOX.h) {
  const neckY = THERMO_STEM_BOTTOM_Y;
  const stemR = 20;
  const bulbR = 42;
  if (y <= neckY) return stemR;
  const t = Math.min(1, (y - neckY) / (vbH - neckY - 4));
  return stemR + (bulbR - stemR) * t;
}
