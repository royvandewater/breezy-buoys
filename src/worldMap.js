import { Actor, ImageSource, vec } from "excalibur";

const scale = 1;

export class WorldMap extends Actor {
  /** @type {ImageSource} */
  imageSource;

  constructor({ imageSource } = {}) {
    super();
    this.imageSource = imageSource;
  }

  onInitialize(engine) {
    this.graphics.use(this.imageSource.toSprite());
    this.pos = vec(engine.halfDrawWidth, engine.halfDrawHeight);
    this.scale = vec(scale, scale);
  }
}
