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
    // Set z-index to render behind everything else
    this.z = -100;
  }

  onInitialize(engine) {
    this.graphics.use(this.imageSource.toSprite());
    // Only set initial position if not already set by chunk manager
    if (this.pos.x === 0 && this.pos.y === 0) {
      this.pos = vec(engine.halfDrawWidth, engine.halfDrawHeight);
    }
    this.scale = vec(this.scaleFactor, this.scaleFactor);
  }
}
