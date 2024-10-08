/// <reference types="../esm_cache/excalibur.d.ts" />

import {
  DefaultPhysicsConfig,
  DisplayMode,
  Engine,
  SolverStrategy,
} from "excalibur";
import { Wind } from "./wind.js";
import {
  ApplyDragToBoatSystem,
  ApplyTorqueToSailSystem,
  Boat,
  DebugWindPushesSailSystem,
  ResolveBoatForces,
  RudderRotatesBoatSystem,
  SailPushesBoatSystem,
  WindPushesSailSystem,
  WindRotatesSailSystem,
} from "./boat.js";
import { ControlSystem } from "./controls.js";
import { IndicateWindSystem } from "./indicateWind.js";
import { IndicateSpeedSystem } from "./indicateSpeed.js";
import { Spawn3RandomBuoysSystem } from "./buoys.js";

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
world.systemManager.addSystem(RudderRotatesBoatSystem);
world.systemManager.addSystem(IndicateWindSystem);
world.systemManager.addSystem(IndicateSpeedSystem);
world.systemManager.addSystem(Spawn3RandomBuoysSystem);
