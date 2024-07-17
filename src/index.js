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
import { BoatComponent, WindComponent, WindPushesBoatSystem } from "./wind.js";

const game = new Engine({
  displayMode: DisplayMode.FillScreen,
});
game.start();

const boatPoints = [
  vec(0, 0),
  vec(20, 40),
  vec(20, 80),
  vec(-20, 80),
  vec(-20, 40),
];
const boat = new Actor({
  pos: vec(game.halfDrawWidth, game.halfDrawHeight),
  collider: new PolygonCollider({ points: boatPoints }),
});
boat.addComponent(new BoatComponent());
const boatGraphic = new Polygon({
  points: boatPoints,
  color: Color.Green,
});
boat.graphics.use(boatGraphic);

game.currentScene.add(boat);

const world = game.currentScene.world;

const wind = new Entity({ components: [new WindComponent()] });
world.entityManager.addEntity(wind);
world.systemManager.addSystem(WindPushesBoatSystem);
