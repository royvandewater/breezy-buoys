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

export class SpeedGuage extends ScreenElement {
  #element = document.getElementById("speed-gauge");

  constructor() {
    super({ pos: vec(500, 50) });
  }

  /** @param {number} velocity */
  setVelocity(velocity) {
    this.#element.innerText = `${velocity.toFixed(1)}`;
  }
}

export class IndicateSpeedSystem extends System {
  systemType = SystemType.Draw;

  /** @type {Query<typeof BoatComponent>} */
  #boats;

  #guage = new SpeedGuage();

  /** @param {World} world */
  initialize(world) {
    this.#boats = world.query([BoatComponent, BodyComponent]);

    world.scene.add(this.#guage);
  }

  update(world) {
    const boatBody = this.#boats.entities[0].get(BodyComponent);

    if (!boatBody) return;

    const velocity = boatBody.vel.size;

    this.#guage.setVelocity(velocity);
  }
}
