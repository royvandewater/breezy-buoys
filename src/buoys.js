import {
  Actor,
  Circle,
  Color,
  Shape,
  System,
  SystemType,
  vec,
  Vector,
  World,
} from "excalibur";

class Buoy extends Actor {
  /** @type {number} */
  #index;

  /**
   * @param {number} index
   * @param {Vector} pos
   */
  constructor(index, { x, y }) {
    super({ x, y });
    this.#index = index;
  }

  onInitialize() {
    this.graphics.use(new Circle({ radius: 10, color: Color.Orange }));
    this.collider = Shape.Circle({ radius: 10 });
  }

  get index() {
    return this.#index;
  }

  /** @param {Vector} pos */
  static withPos(pos) {
    const buoy = new Buoy();
    buoy.body.pos = pos;
    return buoy;
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

    for (let i = 0; i < 3; i++) {
      const x = xMin + Math.random() * width;
      const y = yMin + Math.random() * height;
      world.scene.add(new Buoy(i, vec(x, y)));
    }
  }

  update() {}
}
