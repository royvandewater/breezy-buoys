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

const hullPoints = [
  vec(0, 0),
  vec(20, 80),
  vec(20, 160),
  vec(-20, 160),
  vec(-20, 80),
];

export class BoatComponent extends Component {
  constructor() {
    super();
    this.impulses = [];
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
    this.rotation = Math.PI / 8;
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
      const keel = vec(0, 1).rotate(body.rotation).normalize().negate();

      // calculate the portion of the impulse that is parallel to the keel
      const parallel = impulse.dot(keel);

      const force = keel.scale(parallel);

      Debug.drawLine(body.pos, body.pos.add(impulse), { color: Color.Black });
      Debug.drawLine(body.pos, body.pos.add(force), {
        color: Color.Red,
      });

      // apply the force to the boat
      body.vel = body.vel.add(force);

      // clear the boat impulses
      boat.impulses = [];
    }
  }
}

export class SailComponent extends Component {
  constructor() {
    super();
    this.impulse = vec(0, 0);
  }
}

export class Sail extends Actor {
  onInitialize(engine) {
    this.pos = vec(0, 30);
    this.collider = Shape.Box(10, 60);
    this.angularVelocity = 1;

    this.graphics.use(
      new Rectangle({
        width: 10,
        height: 60,
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

      boat.impulses.push(sail.impulse);
    }
  }
}
