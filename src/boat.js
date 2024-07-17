import {
  Actor,
  BodyComponent,
  Color,
  Component,
  Engine,
  Polygon,
  PolygonCollider,
  Rectangle,
  Shape,
  System,
  SystemType,
  vec,
} from "excalibur";

const hullPoints = [
  vec(0, 0),
  vec(20, 80),
  vec(20, 160),
  vec(-20, 160),
  vec(-20, 80),
];

export class BoatComponent extends Component {}

export class Boat extends Actor {
  /**
   * @param {Engine} engine
   */
  onInitialize(engine) {
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

export class SailComponent extends Component {
  constructor() {
    super();
    this.force = vec(0, 0);
  }
}

export class Sail extends Actor {
  onInitialize(engine) {
    this.pos = vec(0, 30);
    this.collider = Shape.Box(10, 60);

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
      console.log("boatEntity", boatEntity);
      const boatBody = boatEntity.get(BodyComponent);

      // TODO: Use applyImpulse?
      boatBody.pos = boatBody.pos.add(sail.force);
    }
  }
}
