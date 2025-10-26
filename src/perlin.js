/**
 * Seeded random number generator using mulberry32 algorithm.
 * @param {number} seed - The seed value
 * @returns {function(): number} A function that returns a pseudo-random number between 0 and 1
 */
function createSeededRandom(seed) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/**
 * Hash function to generate a seed for a given integer coordinate pair.
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} seed - Global seed
 * @returns {number} Hash value
 */
function hash(x, y, seed = 0) {
  let h = seed;
  h = Math.imul(h ^ x, 0x85ebca6b);
  h = Math.imul(h ^ y, 0xc2b2ae35);
  h = h ^ (h >>> 13);
  return h;
}

/**
 * Generate a gradient vector for a specific grid point using a seed.
 * @param {number} x - X grid coordinate
 * @param {number} y - Y grid coordinate
 * @param {number} seed - Seed value
 * @returns {[number, number]} 2D unit vector
 */
function getGradient(x, y, seed = 0) {
  const h = hash(x, y, seed);
  const random = createSeededRandom(h);
  const angle = random() * 2 * Math.PI;
  return [Math.cos(angle), Math.sin(angle)];
}

/**
 * Perlin noise implementation with seed support.
 *
 * This function generates a perlin noise value for a given 2D point.
 *
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} seed - Seed for deterministic generation (default 0)
 * @returns {number} Perlin noise value between -1 and 1
 */
export const perlin = (x, y, seed = 0) => {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);

  const x1 = x0 + 1;
  const y1 = y0 + 1;

  const sx = x - x0;
  const sy = y - y0;

  const g0 = getGradient(x0, y0, seed);
  const g1 = getGradient(x1, y0, seed);
  const g2 = getGradient(x0, y1, seed);
  const g3 = getGradient(x1, y1, seed);

  const n0 = dot(g0, vec2(sx, sy));
  const n1 = dot(g1, vec2(sx - 1, sy));
  const n2 = dot(g2, vec2(sx, sy - 1));
  const n3 = dot(g3, vec2(sx - 1, sy - 1));

  const t = smoothstep(0, 1, sx);
  const u = smoothstep(0, 1, sy);

  return lerp(lerp(n0, n1, t), lerp(n2, n3, t), u);
};

function vec2(x, y) {
  return [x, y];
}

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function smoothstep(a, b, x) {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}

function lerp(a, b, t) {
  return a + t * (b - a);
}
