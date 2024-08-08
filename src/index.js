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
import { Wind, WindComponent } from "./wind.js";
import {
  ApplyDragToBoatSystem,
  ApplyTorqueToSailSystem,
  Boat,
  DebugWindPushesSailSystem,
  ResolveBoatForces,
  SailPushesBoatSystem,
  WindPushesSailSystem,
  WindRotatesSailSystem,
} from "./boat.js";
import { ControlSystem } from "./controls.js";
import { IndicateWindSystem } from "./indicateWind.js";
import { IndicateSpeedSystem } from "./indicateSpeed.js";

const game = new Engine({
  canvasElementId: "game",
  displayMode: DisplayMode.FillScreen,
  fixedUpdateFps: 30,
  physics: {
    ...DefaultPhysicsConfig,
    solver: SolverStrategy.Realistic,
  },
});
game.start();

game.currentScene.add(new Wind());
game.currentScene.add(new Boat());

const world = game.currentScene.world;
world.systemManager.addSystem(WindPushesSailSystem);
world.systemManager.addSystem(SailPushesBoatSystem);
world.systemManager.addSystem(ResolveBoatForces);
world.systemManager.addSystem(ApplyDragToBoatSystem);
world.systemManager.addSystem(ControlSystem);
world.systemManager.addSystem(WindRotatesSailSystem);
world.systemManager.addSystem(ApplyTorqueToSailSystem);
world.systemManager.addSystem(DebugWindPushesSailSystem);
world.systemManager.addSystem(IndicateWindSystem);
world.systemManager.addSystem(IndicateSpeedSystem);
