import {
  Actor,
  Component,
  System,
  SystemType,
  World,
  BodyComponent,
  vec,
} from "excalibur";

export class Wind extends Actor {
  /**
   * @param {Engine} engine
   */
  onInitialize(engine) {
    this.addComponent(new WindComponent());
  }
}

export class WindComponent extends Component {
  constructor(options = { speed: 100, direction: 0 }) {
    super();
    this.speed = options.speed;
    /** wind direction in radians */
    this.direction = options.direction;
  }
}
