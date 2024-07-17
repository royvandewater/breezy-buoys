import {
  Engine,
  DisplayMode,
  Actor,
  Color,
  vec,
  Polygon,
  PolygonCollider,
} from "excalibur";

const game = new Engine({
  displayMode: DisplayMode.FillScreen,
});
game.start();

const boatPoints = [vec(-20, 20), vec(0, -20), vec(20, 20)];
const boat = new Actor({
  pos: vec(game.halfDrawWidth, 100),
  collider: new PolygonCollider({ points: boatPoints }),
});
const boatGraphic = new Polygon({
  points: boatPoints,
  color: Color.Green,
});
boat.graphics.use(boatGraphic);

game.currentScene.add(boat);
