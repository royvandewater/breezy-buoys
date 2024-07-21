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
import { WindComponent } from "./wind.js";
import {
  ApplyDragToBoatSystem,
  Boat,
  DebugWindPushesSailSystem,
  ResolveBoatForces,
  SailPushesBoatSystem,
  WindPushesSailSystem,
} from "./boat.js";
import { ControlSystem } from "./controls.js";

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
world.systemManager.addSystem(ControlSystem);
world.systemManager.addSystem(DebugWindPushesSailSystem);
