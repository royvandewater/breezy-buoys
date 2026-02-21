import {
  Actor,
  BodyComponent,
  Color,
  Polygon,
  ScreenElement,
  System,
  SystemType,
  vec,
  World,
} from "excalibur";

import { BoatComponent } from "./boat.js";
import { LapComponent, Buoy } from "./buoys.js";

export class BuoyIndicator extends ScreenElement {
  constructor() {
    super({ pos: vec(0, 0), anchor: vec(0.5, 0.5) });
  }

  onInitialize(engine) {
    const points = [
      vec(0, -15),
      vec(12, 15),
      vec(0, 8),
      vec(-12, 15),
    ];

    this.graphics.use(new Polygon({ points, color: Color.Yellow }));
  }
}

export class IndicateBuoySystem extends System {
  systemType = SystemType.Draw;

  #indicator = new BuoyIndicator();

  /** @param {World} world */
  initialize(world) {
    this.boatQuery = world.query([BoatComponent, LapComponent, BodyComponent]);
    this.world = world;

    world.scene.add(this.#indicator);
    this.#indicator.graphics.visible = false;
  }

  update() {
    const boatEntity = this.boatQuery.entities[0];
    if (!boatEntity) return;

    const lapComponent = boatEntity.get(LapComponent);
    const boatBody = boatEntity.get(BodyComponent);
    const buoys = this.getBuoys(this.world.scene);

    const nextBuoy = buoys.find(b => b.index === lapComponent.nextBuoyIndex);
    if (!nextBuoy) return;

    const camera = this.world.scene.camera;
    const screenWidth = camera.viewport.width;
    const screenHeight = camera.viewport.height;

    const cameraPos = camera.pos;
    const halfWidth = screenWidth / 2 / camera.zoom;
    const halfHeight = screenHeight / 2 / camera.zoom;

    const padding = 60 / camera.zoom;
    const isOffScreen =
      nextBuoy.pos.x < cameraPos.x - halfWidth + padding ||
      nextBuoy.pos.x > cameraPos.x + halfWidth - padding ||
      nextBuoy.pos.y < cameraPos.y - halfHeight + padding ||
      nextBuoy.pos.y > cameraPos.y + halfHeight - padding;

    if (isOffScreen) {
      const directionToBuoy = nextBuoy.pos.sub(boatBody.pos).normalize();
      const angle = directionToBuoy.toAngle();

      const centerX = screenWidth / 2;
      const centerY = screenHeight / 2;

      const edgePadding = 40;
      const maxX = screenWidth / 2 - edgePadding;
      const maxY = screenHeight / 2 - edgePadding;

      let indicatorX = Math.cos(angle) * 1000;
      let indicatorY = Math.sin(angle) * 1000;

      if (Math.abs(indicatorX / indicatorY) > maxX / maxY) {
        const scale = maxX / Math.abs(indicatorX);
        indicatorX *= scale;
        indicatorY *= scale;
      } else {
        const scale = maxY / Math.abs(indicatorY);
        indicatorX *= scale;
        indicatorY *= scale;
      }

      this.#indicator.pos = vec(centerX + indicatorX, centerY + indicatorY);
      this.#indicator.rotation = angle + Math.PI / 2;
      this.#indicator.graphics.visible = true;
    } else {
      this.#indicator.graphics.visible = false;
    }
  }

  /**
   * @param {Scene} scene
   * @returns {Buoy[]}
   */
  getBuoys(scene) {
    return scene.actors.filter((actor) => actor instanceof Buoy);
  }
}
