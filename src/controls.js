import {
  BodyComponent,
  Keys,
  Keyboard,
  System,
  SystemType,
  Query,
  World,
  clamp,
} from "excalibur";
import { RudderComponent, SailComponent } from "./boat.js";

export class ControlSystem extends System {
  systemType = SystemType.Update;

  /** @type {function} */
  #toggleDebug;

  /** @type {Keyboard}*/
  #keyboard;

  /** @type {Query<typeof RudderComponent | typeof BodyComponent>} */
  #rudderQuery;

  /** @type {Query<typeof SailComponent | typeof BodyComponent>} */
  #sailQuery;

  /** @param {World} world */
  initialize(world) {
    this.#keyboard = world.scene.input.keyboard;
    this.#rudderQuery = world.query([RudderComponent, BodyComponent]);
    this.#sailQuery = world.query([SailComponent, BodyComponent]);

    this.#toggleDebug = () => world.scene.engine.toggleDebug();
  }

  /**
   * @param {World} world
   * @param {number} delta
   * */
  preupdate(world, delta) {
    const rudder = this.#rudderQuery.entities[0].get(BodyComponent);
    const sail = this.#sailQuery.entities[0].get(SailComponent);

    if (this.#keyboard.wasPressed(Keys.F1)) {
      this.#toggleDebug();
    }

    if (this.#keyboard.isHeld(Keys.A)) {
      rudder.transform.rotation += 0.05;
    }
    if (this.#keyboard.isHeld(Keys.D)) {
      rudder.transform.rotation -= 0.05;
    }

    let rotation = rudder.transform.rotation;
    if (rotation > Math.PI) {
      rotation = rotation - 2 * Math.PI;
    }

    const rudderLimit = Math.PI / 2 - Math.PI / 6;
    rudder.transform.rotation = clamp(rotation, -rudderLimit, rudderLimit);

    if (this.#keyboard.isHeld(Keys.Up)) {
      sail.mainSheet += 1;
    }
    if (this.#keyboard.isHeld(Keys.Down)) {
      const mainSheet = Math.min(sail.mainSheet, sail.currentMainSheetMin);

      sail.mainSheet = mainSheet - 1;
    }
    sail.mainSheet = clamp(sail.mainSheet, 25, 100);
  }

  update(delta) {}
}
