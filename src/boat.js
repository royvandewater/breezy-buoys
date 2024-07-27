import {
  Actor,
  BodyComponent,
  CollisionType,
  Color,
  Component,
  Debug,
  Engine,
  Polygon,
  PolygonCollider,
  Rectangle,
  Shape,
  System,
  SystemType,
  vec,
  Vector,
} from "excalibur";
import { WindComponent } from "./wind.js";

const hullPoints = [
  vec(0, 0),
  vec(80, 20),
  vec(160, 20),
  vec(160, -20),
  vec(80, -20),
];

export class BoatComponent extends Component {
  constructor() {
    super();
    this.impulses = [];
    this.rudder = 0;
  }
}

export class Boat extends Actor {
  constructor() {
    super({ collisionType: CollisionType.Active });
  }

  /**
   * @param {Engine} engine
   */
  onInitialize(engine) {
    // this.angularVelocity = 0.5;
    // this.rotation = -Math.PI / 4;
    this.rotation = 0;
    this.pos = vec(engine.halfDrawWidth, engine.halfDrawHeight);
    this.collider = new PolygonCollider({ points: hullPoints });

    this.graphics.use(
      new Polygon({
        points: hullPoints,
        color: Color.Green,
      })
    );

    this.addComponent(new BoatComponent());

    this.addChild(new Sail());
  }
}

export class ApplyDragToBoatSystem extends System {
  static dragCoefficient = 0.01;

  systemType = SystemType.Update;

  /** @param {World} world */
  initialize(world) {
    this.boatQuery = world.query([BodyComponent, BoatComponent]);
  }

  /** @param {number} delta */
  update(delta) {
    const dragCoefficient = ApplyDragToBoatSystem.dragCoefficient;

    for (const boatEntity of this.boatQuery.entities) {
      const body = boatEntity.get(BodyComponent);
      const vel = body.vel;
      const dragForce = 0.5 * dragCoefficient * vel.size ** 2;

      body.vel = body.vel.add(vel.negate().normalize().scale(dragForce));
    }
  }
}

export class ResolveBoatForces extends System {
  systemType = SystemType.Update;

  /** @param {World} world */
  initialize(world) {
    this.boatQuery = world.query([BodyComponent, BoatComponent]);
  }

  /** @param {number} delta */
  update(delta) {
    for (const boatEntity of this.boatQuery.entities) {
      const boat = boatEntity.get(BoatComponent);
      const body = boatEntity.get(BodyComponent);

      const impulse = boat.impulses.reduce(
        (acc, force) => acc.add(force),
        vec(0, 0)
      );

      // Now we have the combined boat impulses in impulse. We need to apply this to the boat's velocity,
      // but we need to take the boat's keel into account. The keel resists forces that are perpendicular to it.
      // that means we neet to calculate the portion of the force that is parallel to the keel

      // create a vector that runs parallel to the boat called keel
      const keel = vec(1, 0).rotate(body.rotation).normalize();

      // calculate the portion of the impulse that is parallel to the keel
      const parallel = impulse.dot(keel);

      const parallelForce = keel.scale(parallel);
      body.vel = body.vel.add(parallelForce);

      // calculate the portion of the impulse that is perpendicular to the keel
      const perpendicular = impulse.dot(keel.rotate(Math.PI / 2));
      // reduce the perpendicular force by 90% to simulate the keel's resistance to sideways forces
      const perpendicularForce = keel
        .rotate(Math.PI / 2)
        .scale(perpendicular)
        .scale(0.1);

      body.vel = body.vel.add(perpendicularForce);

      // clear the boat impulses
      boat.impulses = [];
    }
  }
}

export class SailComponent extends Component {
  constructor() {
    super();
    this.dragImpulse = vec(0, 0);
    this.liftImpulse = vec(0, 0);
    this.torque = 0;
  }
}

export class Sail extends Actor {
  onInitialize(engine) {
    this.anchor = vec(0.0, 0.5);
    this.pos = vec(0, 0);
    this.collider = Shape.Box(60, 10);
    this.rotation = 0.0;

    this.graphics.use(
      new Rectangle({
        width: 60,
        height: 10,
        color: Color.White,
      })
    );

    this.addComponent(new SailComponent());
  }
}

export class SailPushesBoatSystem extends System {
  systemType = SystemType.Update;

  /**
   * @param {World} world
   */
  initialize(world) {
    this.sailQuery = world.query([SailComponent]);
  }

  /** @param {number} delta */
  update(delta) {
    for (const sailEntity of this.sailQuery.entities) {
      const sail = sailEntity.get(SailComponent);

      const boatEntity = sailEntity.parent;
      const boat = boatEntity.get(BoatComponent);

      boat.impulses.push(sail.dragImpulse);
      boat.impulses.push(sail.liftImpulse);
    }
  }
}

export class DebugWindPushesSailSystem extends System {
  systemType = SystemType.Draw;
  static multiplier = 1;

  /** @param {World} world */
  initialize(world) {
    this.sailsQuery = world.query([SailComponent, BodyComponent]);
  }

  update() {
    const multiplier = DebugWindPushesSailSystem.multiplier;

    for (const sailEntity of this.sailsQuery.entities) {
      const sail = sailEntity.get(SailComponent);
      const start = sailEntity.get(BodyComponent).transform.globalPos;

      Debug.drawLine(start, start.add(sail.dragImpulse).scale(multiplier), {
        color: Color.Red,
      });
      Debug.drawLine(start, start.add(sail.liftImpulse).scale(multiplier), {
        color: Color.White,
      });
    }
  }
}

export class WindPushesSailSystem extends System {
  static sailDragCoefficient = 10;
  static sailLiftCoefficient = 10;

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

        const dragMagnitude = Math.abs(
          Math.sin(wind.direction - body.rotation)
        );

        sail.dragImpulse = windVector.scale(
          dragMagnitude * WindPushesSailSystem.sailDragCoefficient
        );

        // now we have to calculate the lift force on the sail
        // the lift force is perpendicular to the wind direction
        // the lift force is greatest when the sail is 15 degrees off the wind

        // first calculate the vector perpendicular to the wind
        let liftDirection = windVector.rotate(Math.PI / 2);

        // now negate the lift direction if the sail is on the wrong side of the wind
        const sailAngle = sailEntity.transform.globalRotation - Math.PI / 2;
        const windAngle = wind.direction;
        const angleDifference = sailAngle - windAngle;
        if (angleDifference < Math.PI && angleDifference > -Math.PI) {
          liftDirection = liftDirection.negate();
        }

        // now calculate the magnitude of the lift force such that it is greatest when the sail is 15 degrees off the wind
        const fifteenDegrees = Math.PI / 12;
        const quarterTurn = Math.PI / 2;
        const idealRotationOffset =
          body.rotation + quarterTurn - fifteenDegrees;

        const liftMagnitude = Math.abs(
          Math.sin(wind.direction - idealRotationOffset)
        );
        sail.liftImpulse = liftDirection.scale(
          liftMagnitude * WindPushesSailSystem.sailLiftCoefficient
        );
      }
    }
  }
}

export class WindRotatesSailSystem extends System {
  systemType = SystemType.Update;

  static sailTorqueCoefficient = 0.1;

  initialize(world) {
    this.windQuery = world.query([WindComponent]);
    this.sailsQuery = world.query([SailComponent, BodyComponent]);
  }

  update(delta) {
    for (const windEntity of this.windQuery.entities) {
      const wind = windEntity.get(WindComponent);
      const windVector = vec(wind.speed, 0).rotate(wind.direction);

      for (const sailEntity of this.sailsQuery.entities) {
        const body = sailEntity.get(BodyComponent);
        const sail = sailEntity.get(SailComponent);

        // calculate the angle between the wind and the sail

        // console.log("windVector", windVector, windVector.toAngle());
        const angle = windVector.toAngle() - body.transform.globalRotation;

        // apply a torque to the sail to rotate the trailing edge of the sail away from the wind

        // calculate the torque. The torque is greatest when the sail is at a right angle to the wind
        sail.torque =
          Math.cos(angle + Math.PI / 2) *
          WindRotatesSailSystem.sailTorqueCoefficient;

        // figure out the direction of the torque
        const sailAngle = sailEntity.transform.globalRotation;
        const windAngle = wind.direction;
        const angleDifference = sailAngle - windAngle;
        if (angleDifference > Math.PI || angleDifference < -Math.PI) {
          sail.torque *= -1;
        }
      }
    }
  }
}

export class ApplyTorqueToSailSystem extends System {
  systemType = SystemType.Update;

  initialize(world) {
    this.sailsQuery = world.query([SailComponent, BodyComponent]);
  }

  update(delta) {
    for (const sailEntity of this.sailsQuery.entities) {
      const sail = sailEntity.get(SailComponent);
      const body = sailEntity.get(BodyComponent);

      // console.log("applying torque", sail.torque);
      body.applyAngularImpulse(vec(0, 0), sail.torque);
    }
  }
}
