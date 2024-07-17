import {
  Actor,
  Color,
  DisplayMode,
  Engine,
  Entity,
  Polygon,
  PolygonCollider,
  vec,
} from "excalibur";
import { WindComponent, WindPushesSailSystem } from "./wind.js";
import { Boat, SailPushesBoatSystem } from "./boat.js";

const game = new Engine({
  displayMode: DisplayMode.FillScreen,
  fixedUpdateFps: 30,
});
game.start();

game.currentScene.add(new Boat());

const world = game.currentScene.world;

const wind = new Entity({ components: [new WindComponent()] });
world.entityManager.addEntity(wind);
world.systemManager.addSystem(WindPushesSailSystem);
world.systemManager.addSystem(SailPushesBoatSystem);
