import {
  Actor,
  BodyComponent,
  Circle,
  Color,
  Component,
  Shape,
  System,
  SystemType,
  vec,
  Vector,
  World,
  CollisionType,
} from "excalibur";
import { BoatComponent } from "./boat.js";

export class LapComponent extends Component {
  constructor() {
    super();
    this.currentLap = 0;
    this.nextBuoyIndex = 0;
  }
}

export class Buoy extends Actor {
  /** @type {number} */
  #index;
  /** @type {boolean} */
  #isNext = false;

  /**
   * @param {number} index
   * @param {Vector} pos
   */
  constructor(index, { x, y }) {
    super({ x, y, collisionType: CollisionType.Passive });
    this.#index = index;
  }

  onInitialize() {
    this.updateGraphics();
    this.collider = Shape.Circle({ radius: 10 });
  }

  get index() {
    return this.#index;
  }

  get isNext() {
    return this.#isNext;
  }

  set isNext(value) {
    this.#isNext = value;
    this.updateGraphics();
  }

  updateGraphics() {
    const color = this.#isNext ? Color.Yellow : Color.Orange;
    const radius = this.#isNext ? 15 : 10;
    this.graphics.use(new Circle({ radius, color }));
  }

  /** @param {Vector} pos */
  static withPos(pos) {
    const buoy = new Buoy();
    buoy.body.pos = pos;
    return buoy;
  }
}

export class TrackLapProgressSystem extends System {
  systemType = SystemType.Update;
  previousAngles = new Map();

  /**
   * @param {World} world
   */
  initialize(world) {
    this.boatQuery = world.query([BoatComponent, LapComponent]);
    this.world = world;
  }

  update() {
    for (const boatEntity of this.boatQuery.entities) {
      const lapComponent = boatEntity.get(LapComponent);
      const buoys = this.getBuoys(this.world.scene);
      const boatPos = boatEntity.get(BodyComponent).pos;

      const nextBuoy = buoys.find(b => b.index === lapComponent.nextBuoyIndex);
      if (!nextBuoy) continue;

      const distance = boatPos.distance(nextBuoy.pos);
      const roundingDistance = 400;

      if (distance < roundingDistance) {
        const angle = nextBuoy.pos.sub(boatPos).toAngle();
        const key = `${boatEntity.id}-${nextBuoy.index}`;

        if (this.previousAngles.has(key)) {
          const prevAngle = this.previousAngles.get(key);
          let angleDelta = angle - prevAngle;

          if (angleDelta > Math.PI) angleDelta -= 2 * Math.PI;
          if (angleDelta < -Math.PI) angleDelta += 2 * Math.PI;

          if (!nextBuoy.totalAngle) nextBuoy.totalAngle = 0;
          nextBuoy.totalAngle += angleDelta;

          if (nextBuoy.totalAngle <= -Math.PI * 0.6) {
            this.markBuoyPassed(nextBuoy, lapComponent, buoys);
            this.previousAngles.delete(key);
            nextBuoy.totalAngle = 0;
          }
        }

        this.previousAngles.set(key, angle);
      }

      buoys.forEach((buoy) => {
        buoy.isNext = buoy.index === lapComponent.nextBuoyIndex;
      });
    }
  }

  markBuoyPassed(buoy, lapComponent, buoys) {
    lapComponent.nextBuoyIndex = (lapComponent.nextBuoyIndex + 1) % 3;

    if (buoy.index === 2) {
      lapComponent.currentLap++;
    }

    buoys.forEach((b) => {
      b.isNext = b.index === lapComponent.nextBuoyIndex;
    });
  }

  /**
   * @param {Scene} scene
   * @returns {Buoy[]}
   */
  getBuoys(scene) {
    return scene.actors.filter((actor) => actor instanceof Buoy);
  }
}

export class SpawnStandardCourseSystem extends System {}

export class Spawn3RandomBuoysSystem extends System {
  systemType = SystemType.Update;

  /**
   * @param {World} world
   */
  initialize(world) {
    const contentArea = world.scene.engine.screen.contentArea;

    const bottomRight = vec(contentArea.right, contentArea.bottom);

    const padding = 200;
    const xMin = padding;
    const xMax = bottomRight.x - padding;
    const yMin = padding;
    const yMax = bottomRight.y - padding;

    const width = xMax - xMin;
    const height = yMax - yMin;

    const minDistance = 300;
    const buoyPositions = [];

    for (let i = 0; i < 3; i++) {
      let attempts = 0;
      let position;
      let validPosition = false;

      while (!validPosition && attempts < 100) {
        const x = xMin + Math.random() * width;
        const y = yMin + Math.random() * height;
        position = vec(x, y);

        validPosition = true;
        for (const existingPos of buoyPositions) {
          if (position.distance(existingPos) < minDistance) {
            validPosition = false;
            break;
          }
        }

        attempts++;
      }

      buoyPositions.push(position);
      world.scene.add(new Buoy(i, position));
    }
  }

  update() {}
}
