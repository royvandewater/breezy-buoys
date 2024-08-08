import {
  Circle,
  Color,
  Polygon,
  Query,
  ScreenElement,
  System,
  SystemType,
  vec,
  World,
} from "excalibur";

import { SailComponent } from "./boat.js";
import { WindComponent } from "./wind.js";

export class WindGuage extends ScreenElement {
  constructor() {
    super({ pos: vec(55, 55) });
  }

  /**
   * @param {Engine} engine
   */
  onInitialize(engine) {
    this.anchor = vec(0.5, 0.5);
    this.graphics.use(
      new Circle({
        radius: 50,
        strokeColor: Color.White,
        lineWidth: 5,
        color: Color.Transparent,
      })
    );
  }
}

export class WindIndicator extends ScreenElement {
  /** @type {Color} */
  #color;

  constructor({ color = Color.White } = {}) {
    super({ pos: vec(55, 55), anchor: vec(0.5, 0.5) });
    this.#color = color;
  }

  /**
   * @param {Engine} engine
   */
  onInitialize(engine) {
    const points = [
      vec(0, 0),
      vec(20, 10),
      vec(20, 5),
      vec(80, 5),
      vec(80, -5),
      vec(20, -5),
      vec(20, -10),
    ];

    this.graphics.use(new Polygon({ points, color: this.#color }));
  }
}

export class IndicateWindSystem extends System {
  systemType = SystemType.Draw;

  /** @type {Query<typeof SailComponent>} */
  #sails;

  /** @type {Query<typeof WindComponent>} */
  #winds;

  #guage = new WindGuage();
  #windIndicator = new WindIndicator({ color: Color.Red });
  #apparentWindIndicator = new WindIndicator({ color: Color.Blue });

  /** @param {World} world */
  initialize(world) {
    this.#sails = world.query([SailComponent]);
    this.#winds = world.query([WindComponent]);

    world.scene.add(this.#guage);
    world.scene.add(this.#windIndicator);
    world.scene.add(this.#apparentWindIndicator);
  }

  update(world) {
    const wind = this.#winds.entities[0].get(WindComponent);
    const sail = this.#sails.entities[0].get(SailComponent);

    if (!wind || !sail) return;

    const velocity = sail.globalVelocity;
    const windVector = vec(wind.speed, 0).rotate(wind.direction);
    const apparentWindVector = windVector.add(velocity.negate());

    this.#windIndicator.body.rotation = windVector.negate().toAngle();

    this.#apparentWindIndicator.body.rotation = apparentWindVector
      .negate()
      .toAngle();
  }
}
