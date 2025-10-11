import {
  Actor,
  Component,
  vec,
  Vector,
  ParticleEmitter,
  EmitterType,
} from "excalibur";

const PARTICLE_EMIT_INTERVAL = 100000000000;
const WIND_SPEED = 100;
const WIND_VARIANCE = 10;
const WIND_ANGLE_VARIANCE = 0.05;
const WIND_DIRECTION = 0;

export class Wind extends Actor {
  /** @type {number} */
  lastParticleEmittedAt = Date.now();

  /** @type {ParticleEmitter} */
  particleEmitter;

  /** * @param {Engine} engine */
  onInitialize(engine) {
    this.addComponent(
      new WindComponent({ speed: WIND_SPEED, direction: WIND_DIRECTION })
    );
    this.lastParticleEmittedAt = Date.now() - PARTICLE_EMIT_INTERVAL;

    this.particleEmitter = new ParticleEmitter({
      pos: this.pos,
      emitterType: EmitterType.Rectangle,
      width: engine.drawWidth,
      height: engine.drawHeight,
      isEmitting: true,
      emitRate: 100,
      particle: {
        minSpeed: WIND_SPEED - WIND_VARIANCE,
        maxSpeed: WIND_SPEED + WIND_VARIANCE,
        minAngle: -WIND_ANGLE_VARIANCE,
        maxAngle: WIND_ANGLE_VARIANCE,
        opacity: 0.8,
        fade: true,
        life: 3000,
        minSize: 1,
        maxSize: 5,
      },
    });
    engine.currentScene.world.add(this.particleEmitter);
  }

  onPostUpdate(engine, delta) {
    const wind = this.get(WindComponent);
    this.vel = this.vel.add(wind.windVector.scale(delta));
  }
}

export class WindComponent extends Component {
  constructor(options) {
    super();
    this.speed = options.speed;
    /** wind direction in radians */
    this.direction = options.direction;
  }

  /**
   * @returns {Vector}
   */
  get windVector() {
    return vec(this.speed, 0).rotate(this.direction);
  }
}
