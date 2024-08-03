import {
  BodyComponent,
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

import { BoatComponent } from "./boat.js";
import { WindComponent } from "./wind.js";

export class WindGuage extends ScreenElement {
  constructor() {
    super({ pos: vec(50, 50) });
  }

  /**
   * @param {Engine} engine
   */
  onInitialize(engine) {
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
    super({ pos: vec(50, 50) });
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

  /** @type {Query<typeof BoatComponent | typeof BodyComponent>} */
  #boats;

  /** @type {Query<typeof WindComponent>} */
  #winds;

  #guage = new WindGuage();
  #windIndicator = new WindIndicator({ color: Color.Red });
  #apparentWindIndicator = new WindIndicator({ color: Color.Blue });

  /** @param {World} world */
  initialize(world) {
    this.#boats = world.query([BoatComponent, BodyComponent]);
    this.#winds = world.query([WindComponent]);

    world.scene.add(this.#windIndicator);
    world.scene.add(this.#apparentWindIndicator);
  }

  update(world) {
    const wind = this.#winds.entities[0].get(WindComponent);
    const boatBody = this.#boats.entities[0].get(BodyComponent);

    if (!wind || !boatBody) return;

    const boatVector = boatBody.vel;
    const windVector = vec(1, 0).rotate(wind.direction);
    const apparentWindVector = windVector.sub(boatVector);

    this.#windIndicator.body.rotation = windVector.negate().toAngle();

    this.#apparentWindIndicator.body.rotation = apparentWindVector
      .negate()
      .toAngle();
  }
}
