import { SailComponent } from "./boat.js";
import {
  Component,
  System,
  SystemType,
  World,
  BodyComponent,
  vec,
} from "excalibur";

export class WindComponent extends Component {
  constructor(options = { speed: 10, direction: 0 }) {
    super();
    this.speed = options.speed;
    /** wind direction in radians */
    this.direction = options.direction;
  }
}

export class WindPushesSailSystem extends System {
  systemType = SystemType.Update;

  /**
   * @param {World} world
   */
  initialize(world) {
    this.windQuery = world.query([WindComponent]);
    this.sailsQuery = world.query([SailComponent, BodyComponent]);
  }

  /** @param {number} delta */
  update(delta) {
    for (const windEntity of this.windQuery.entities) {
      const wind = windEntity.get(WindComponent);
      const windVector = vec(wind.speed, 0).rotate(wind.direction);

      for (const sailEntity of this.sailsQuery.entities) {
        const body = sailEntity.get(BodyComponent);
        const sail = sailEntity.get(SailComponent);

        const magnitude = Math.abs(Math.cos(wind.direction - body.rotation));

        sail.force = windVector.scale(magnitude);
      }
    }
  }
}
