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
    this.direction = options.direction;
  }
}

export class BoatComponent extends Component {}

export class WindPushesBoatSystem extends System {
  types = ["WindComponent"];
  systemType = SystemType.Update;

  /**
   * @param {World} world
   */
  constructor(world) {
    super(world);

    this.windQuery = world.query([WindComponent]);
    this.boatsQuery = world.query([BoatComponent, BodyComponent]);
  }

  update(delta) {
    for (const windEntity of this.windQuery.entities) {
      const wind = windEntity.get(WindComponent);
      const windVector = vec(wind.speed, 0).rotate(wind.direction);

      for (const boatEntity of this.boatsQuery.entities) {
        const body = boatEntity.get(BodyComponent);

        body.pos = body.pos.add(windVector.scale(delta / 1000));
      }
    }
  }
}
