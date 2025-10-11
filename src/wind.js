import { Actor, Circle, Color, Component, vec, Vector } from "excalibur";

const PARTICLE_EMIT_INTERVAL = 100;
const PARTICLE_RADIUS = 2;
const PARTICLE_SPEED = 100;
const PARTICLE_LIFESPAN = 2000;

export class Wind extends Actor {
  lastParticleEmittedAt = Date.now();

  onInitialize() {
    this.addComponent(new WindComponent());
    this.lastParticleEmittedAt = Date.now();
  }

  onPostUpdate(engine, delta) {
    const wind = this.get(WindComponent);
    this.vel = this.vel.add(wind.windVector.scale(delta));

    if (Date.now() - this.lastParticleEmittedAt > PARTICLE_EMIT_INTERVAL) {
      this.lastParticleEmittedAt = Date.now();
      engine.currentScene.add(new WindParticle());
    }
  }
}

export class WindComponent extends Component {
  constructor(options = { speed: 100, direction: 0 }) {
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

class WindParticle extends Actor {
  createdAt = Date.now();

  /** @type {WindComponent} */
  windEntity;

  /**
   * @param {Engine} engine
   */
  onInitialize(engine) {
    this.createdAt = Date.now();
    this.pos = vec(
      engine.drawWidth * Math.random(),
      engine.drawHeight * Math.random()
    );

    this.graphics.use(
      new Circle({ radius: PARTICLE_RADIUS, color: Color.White })
    );
    this.wind = engine.currentScene.world
      .query([WindComponent])
      .entities[0].get(WindComponent);
  }

  /**
   * @param {Engine} engine
   * @param {number} delta
   */
  onPostUpdate(_engine, delta) {
    const age = Date.now() - this.createdAt;
    const percentOfLifespan = age / PARTICLE_LIFESPAN;

    if (percentOfLifespan > 1) {
      this.kill();
      return;
    }

    this.graphics.current.color.a = alphaCurve(percentOfLifespan);

    this.vel = this.vel
      .add(this.wind.windVector.scale(delta * PARTICLE_SPEED))
      .clampMagnitude(PARTICLE_SPEED);
  }
}

const alphaCurve = (percentOfLifespan) => {
  percentOfLifespan = clamp(percentOfLifespan, 0, 1);

  if (percentOfLifespan < 0.25) {
    return percentOfLifespan / 0.25;
  } else if (percentOfLifespan > 0.75) {
    return 1 - (percentOfLifespan - 0.75) / 0.25;
  } else {
    return 1;
  }
};

const clamp = (value, min, max) => Math.max(min, Math.min(value, max));
