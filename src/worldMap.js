import { Actor, ImageSource } from "excalibur";
import { Colors } from "./colors.js";
import { perlin } from "./perlin.js";

export class WorldMap extends Actor {
  constructor() {
    super();
  }

  onInitialize(engine) {
    const imageSource = new ImageSource(base64BitMapFromPerlin());
    const sprite = imageSource.toSprite();
    this.graphics.use(sprite);
  }
}

/**
 * Generates a base64 encoded bitmap from perlin noise.
 */
const base64BitMapFromPerlin = () => {
  const width = 512;
  const height = 512;

  const pixels = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const value = perlin(x / width, y / height);
      const index = (y * width + x) * 4;
      pixels[index] = value * 255;
      pixels[index + 1] = value * 255;
      pixels[index + 2] = value * 255;
      pixels[index + 3] = 255;
    }
  }

  return `data:image/png;base64,${btoa(String.fromCharCode(...pixels))}`;
};
