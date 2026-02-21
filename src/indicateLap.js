import {
  Query,
  ScreenElement,
  System,
  SystemType,
  vec,
  World,
} from "excalibur";

import { BoatComponent } from "./boat.js";
import { LapComponent } from "./buoys.js";

export class LapCounter extends ScreenElement {
  #element = document.getElementById("lap-counter");

  constructor() {
    super({ pos: vec(500, 50) });
  }

  /** @param {number} lap */
  setLap(lap) {
    this.#element.innerText = `Lap: ${lap}`;
  }
}

export class IndicateLapSystem extends System {
  systemType = SystemType.Draw;

  /** @type {Query<typeof BoatComponent>} */
  #boats;

  #counter = new LapCounter();

  /** @param {World} world */
  initialize(world) {
    this.#boats = world.query([BoatComponent, LapComponent]);

    world.scene.add(this.#counter);
  }

  update(world) {
    const boat = this.#boats.entities[0];

    if (!boat) return;

    const lapComponent = boat.get(LapComponent);

    this.#counter.setLap(lapComponent.currentLap);
  }
}
