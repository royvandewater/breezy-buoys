import { Actor, ImageSource, vec } from "excalibur";

export class WorldMap extends Actor {
  /** @type {ImageSource} */
  imageSource;

  /** @type {number} */
  scaleFactor;

  constructor({ imageSource, scale } = {}) {
    super();
    this.imageSource = imageSource;
    this.scaleFactor = scale;
  }

  onInitialize(engine) {
    this.graphics.use(this.imageSource.toSprite());
    this.pos = vec(engine.halfDrawWidth, engine.halfDrawHeight);
    this.scale = vec(this.scaleFactor, this.scaleFactor);
  }
}
