// Box fold, sphere fold, then affine scaling. The derivative tracks the
// magnitude of the accumulated scale, including the translated sample.
export const preset = Object.freeze({
  scale: -2.3,
  fold: 1,
  minRadiusSquared: 0.25,
  fixedRadiusSquared: 1,
  iterations: 14,
});

export function distance([x, y, z], config = preset) {
  const { scale, fold, minRadiusSquared, fixedRadiusSquared, iterations } = config;
  let a = x, b = y, c = z, derivative = 1;
  for (let i = 0; i < iterations; i++) {
    a = 2 * Math.max(-fold, Math.min(fold, a)) - a;
    b = 2 * Math.max(-fold, Math.min(fold, b)) - b;
    c = 2 * Math.max(-fold, Math.min(fold, c)) - c;
    const radiusSquared = a * a + b * b + c * c;
    const factor = fixedRadiusSquared / Math.max(minRadiusSquared, Math.min(fixedRadiusSquared, radiusSquared));
    const multiplier = factor * scale;
    a = a * multiplier + x;
    b = b * multiplier + y;
    c = c * multiplier + z;
    derivative = derivative * Math.abs(multiplier) + 1;
  }
  return Math.hypot(a, b, c) / derivative;
}

export const distanceGLSL = `
uniform float uScale, uFold, uMinRadiusSquared, uFixedRadiusSquared;
uniform int uIterations;

float distanceToBox(vec3 p) {
  vec3 z = p;
  float derivative = 1.0;
  for (int i = 0; i < 32; ++i) {
    if (i >= uIterations) break;
    z = 2.0 * clamp(z, -uFold, uFold) - z;
    float factor = uFixedRadiusSquared / clamp(dot(z, z), uMinRadiusSquared, uFixedRadiusSquared);
    float multiplier = factor * uScale;
    z = z * multiplier + p;
    derivative = derivative * abs(multiplier) + 1.0;
  }
  return length(z) / derivative;
}
`;
