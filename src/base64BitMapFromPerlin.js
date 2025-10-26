import { perlin } from "./perlin.js";
import { Colors } from "./colors.js";
/**
 * The threshold for the perlin noise to determine if the pixel is ocean or beach. Lower numbers
 * mean more land
 **/
const threshold = 0.4;

/**
 * Generates a base64 encoded bitmap from perlin noise.
 */
export const base64BitMapFromPerlin = (size = 512) => {
  const width = size;
  const height = width;

  // Create an off-screen canvas
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  // Create ImageData and populate with Perlin noise
  const imageData = ctx.createImageData(width, height);
  const pixels = imageData.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const value = perlin(x / width, y / height);
      const adjustedValue = value < threshold ? 0 : 1;
      const color = lerpColor(Colors.ocean, Colors.beach, adjustedValue);
      const index = (y * width + x) * 4;
      pixels[index] = color.r; // R
      pixels[index + 1] = color.g; // G
      pixels[index + 2] = color.b; // B
      pixels[index + 3] = color.a; // A
    }
  }

  // Put the pixel data onto the canvas
  ctx.putImageData(imageData, 0, 0);

  // Generate a valid PNG data URL
  return canvas.toDataURL("image/png");
};

/**
 * Lerps a color between two colors.
 * @param {import("excalibur").Color} color1 - The first color.
 * @param {import("excalibur").Color} color2 - The second color.
 * @param {number} t - The interpolation factor.
 * @returns {import("excalibur").Color} The interpolated color.
 */
const lerpColor = (color1, color2, t) => {
  return {
    r: color1.r + (color2.r - color1.r) * t,
    g: color1.g + (color2.g - color1.g) * t,
    b: color1.b + (color2.b - color1.b) * t,
    a: 255,
  };
};
