/**
 * Perlin noise implementation.
 *
 * This function generates a perlin noise value for a given 2D point.
 *
 * @param {number} x
 * @param {number} y
 */
export const perlin = (x, y) => {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);

  const x1 = x0 + 1;
  const y1 = y0 + 1;

  const sx = x - x0;
  const sy = y - y0;

  const n0 = dot(grid[x0 + y0 * 512], vec2(sx, sy));
  const n1 = dot(grid[x1 + y0 * 512], vec2(sx - 1, sy));
  const n2 = dot(grid[x0 + y1 * 512], vec2(sx, sy - 1));
  const n3 = dot(grid[x1 + y1 * 512], vec2(sx - 1, sy - 1));

  const t = smoothstep(0, 1, sx);
  const u = smoothstep(0, 1, sy);

  return lerp(lerp(n0, n1, t), lerp(n2, n3, t), u);
};

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1];
}

function smoothstep(a, b, x) {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}

function lerp(a, b, t) {
  return a + t * (b - a);
}
