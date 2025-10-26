// Web Worker for generating terrain chunks in background thread
// This keeps Perlin noise calculation off the main thread to prevent stutter

/**
 * Seeded random number generator using mulberry32 algorithm.
 */
function createSeededRandom(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Hash function to generate a seed for a given integer coordinate pair.
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
 */
function getGradient(x, y, seed = 0) {
  const h = hash(x, y, seed);
  const random = createSeededRandom(h);
  const angle = random() * 2 * Math.PI;
  return [Math.cos(angle), Math.sin(angle)];
}

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

/**
 * Perlin noise implementation with seed support.
 */
function perlin(x, y, seed = 0) {
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
}

function lerpColor(color1, color2, t) {
  return {
    r: color1.r + (color2.r - color1.r) * t,
    g: color1.g + (color2.g - color1.g) * t,
    b: color1.b + (color2.b - color1.b) * t,
    a: 255,
  };
}

/**
 * Generate terrain chunk as base64 image
 */
function generateTerrainChunk({
  size,
  scale,
  threshold,
  offsetX,
  offsetY,
  seed,
  oceanColor,
  beachColor,
}) {
  const width = size;
  const height = size;

  // Create off-screen canvas in worker
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Create ImageData and populate with Perlin noise
  const imageData = ctx.createImageData(width, height);
  const pixels = imageData.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Apply offset to sample from different parts of noise space
      const sampleX = (x / width + offsetX) * scale;
      const sampleY = (y / height + offsetY) * scale;
      const value = perlin(sampleX, sampleY, seed);
      const adjustedValue = value < threshold ? 0 : 1;
      const color = lerpColor(oceanColor, beachColor, adjustedValue);
      const index = (y * width + x) * 4;
      pixels[index] = color.r; // R
      pixels[index + 1] = color.g; // G
      pixels[index + 2] = color.b; // B
      pixels[index + 3] = color.a; // A
    }
  }

  // Put the pixel data onto the canvas
  ctx.putImageData(imageData, 0, 0);

  // Convert to blob then to base64
  return canvas.convertToBlob({ type: "image/png" }).then((blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  });
}

// Worker message handler
self.onmessage = async function (e) {
  const { id, data } = e.data;

  try {
    const base64Image = await generateTerrainChunk(data);
    self.postMessage({ id, success: true, data: base64Image });
  } catch (error) {
    self.postMessage({ id, success: false, error: error.message });
  }
};
