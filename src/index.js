import {
  Actor,
  Color,
  DefaultPhysicsConfig,
  DisplayMode,
  Engine,
  Entity,
  Polygon,
  PolygonCollider,
  SolverStrategy,
  vec,
} from "excalibur";
import { WindComponent, WindPushesSailSystem } from "./wind.js";
import {
  ApplyDragToBoatSystem,
  Boat,
  ResolveBoatForces,
  SailPushesBoatSystem,
} from "./boat.js";

const game = new Engine({
  displayMode: DisplayMode.FillScreen,
  fixedUpdateFps: 30,
  physics: {
    ...DefaultPhysicsConfig,
    solver: SolverStrategy.Realistic,
  },
});
game.start();
game.toggleDebug();

game.currentScene.add(new Boat());

const world = game.currentScene.world;

const wind = new Entity({ components: [new WindComponent()] });
world.entityManager.addEntity(wind);
world.systemManager.addSystem(WindPushesSailSystem);
world.systemManager.addSystem(SailPushesBoatSystem);
world.systemManager.addSystem(ResolveBoatForces);
world.systemManager.addSystem(ApplyDragToBoatSystem);
