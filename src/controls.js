import {
  BodyComponent,
  Keys,
  System,
  SystemType,
  World,
  clamp,
} from "excalibur";
import { BoatComponent, SailComponent } from "./boat.js";

export class ControlSystem extends System {
  systemType = SystemType.Update;

  /** @param {World} world */
  initialize(world) {
    this.keyboard = world.scene.input.keyboard;
    this.boatQuery = world.query([BoatComponent, BodyComponent]);
    this.sailQuery = world.query([SailComponent, BodyComponent]);
  }

  /**
   * @param {World} world
   * @param {number} delta
   * */
  preupdate(world, delta) {
    const boatBody = this.boatQuery.entities[0].get(BodyComponent);
    const sailBody = this.sailQuery.entities[0].get(BodyComponent);
    const sail = this.sailQuery.entities[0].get(SailComponent);

    if (this.keyboard.isHeld(Keys.A)) {
      boatBody.transform.rotation -= 0.05;
    }
    if (this.keyboard.isHeld(Keys.D)) {
      boatBody.transform.rotation += 0.05;
    }

    if (this.keyboard.isHeld(Keys.Left)) {
      sailBody.transform.rotation += 0.05;
    }
    if (this.keyboard.isHeld(Keys.Right)) {
      sailBody.transform.rotation -= 0.05;
    }
    if (this.keyboard.isHeld(Keys.Up)) {
      sail.mainSheet += 1;
    }
    if (this.keyboard.isHeld(Keys.Down)) {
      sail.mainSheet -= 1;
    }
    sail.mainSheet = clamp(sail.mainSheet, 25, 100);
  }

  update(delta) {}
}
