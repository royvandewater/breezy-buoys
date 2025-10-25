# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Breezy Buoys is a sailing simulation game built with Excalibur.js. It simulates realistic sailing physics including wind forces, sail mechanics, keel resistance, and rudder control.

## Development Commands

```bash
# Start the development server
pnpm start

# Install dependencies
pnpm install
```

## Architecture

### Entity-Component-System (ECS) Pattern

The game uses Excalibur's ECS architecture:

- **Entities**: `Boat`, `Sail`, `Rudder`, `Wind` (extend `Actor`)
- **Components**: Store data without behavior
  - `BoatComponent`: Stores impulses, rudder angle, mainSailBlock position
  - `SailComponent`: Stores drag/lift impulses, torque, boom geometry, mainsheet length
  - `RudderComponent`: Provides access to parent boat velocity and rotation
  - `WindComponent`: Stores wind speed and direction
- **Systems**: Implement game logic by querying entities with specific components

### System Execution Order

Systems are registered in `src/index.js` and execute in this order:

1. `WindPushesSailSystem` - Calculates drag and lift forces on sail from apparent wind
2. `SailPushesBoatSystem` - Applies sail forces to boat impulses
3. `ResolveBoatForces` - Resolves boat impulses considering keel resistance (5% perpendicular, 100% parallel)
4. `ApplyDragToBoatSystem` - Applies water drag to boat velocity
5. `ControlSystem` - Handles keyboard input for rudder and mainsheet
6. `WindRotatesSailSystem` - Calculates torque from wind on sail
7. `ApplyTorqueToSailSystem` - Applies torque and mainsheet constraints to sail rotation
8. `RudderRotatesBoatSystem` - Rotates boat based on rudder angle and boat speed
9. `IndicateWindSystem` - Visual indicators for wind direction
10. `IndicateSpeedSystem` - Updates speed gauge in DOM
11. `Spawn3RandomBuoysSystem` - Spawns buoy markers
12. `DebugWindPushesSailSystem` - Debug visualization of forces (Draw system)

### Sailing Physics

The simulation models realistic sailing physics:

- **Apparent Wind**: Combines true wind with boat velocity to calculate forces
- **Sail Forces**:
  - Drag force proportional to `sin(angle between wind and sail)`
  - Lift force maximized at 15° off wind, perpendicular to apparent wind
  - Lift always pushes away from mainsheet side
- **Keel Effect**: Boat resists perpendicular forces (95% reduction) but moves freely parallel to keel
- **Mainsheet Constraints**: Uses law of cosines to limit sail rotation based on mainsheet length
- **Rudder Authority**: Rotation force scales with boat speed

### Key Physics Constants

Adjustable coefficients for tuning gameplay (all in `src/boat.js`):

- `ApplyDragToBoatSystem.dragCoefficient` (0.005)
- `WindPushesSailSystem.sailDragCoefficient` (1)
- `WindPushesSailSystem.sailLiftCoefficient` (1)
- `WindRotatesSailSystem.sailTorqueCoefficient` (0.1)
- `RudderRotatesBoatSystem.rudderCoefficient` (0.0005)

## File Structure

- `src/index.js` - Game initialization, system registration
- `src/boat.js` - Boat, Sail, Rudder entities and all related systems
- `src/wind.js` - Wind entity with particle effects
- `src/controls.js` - Keyboard input handling (A/D for rudder, Up/Down for mainsheet, F1 for debug)
- `src/buoys.js` - Buoy spawning system
- `src/indicateWind.js` - Wind direction visualization
- `src/indicateSpeed.js` - Speed gauge updates
- `index.html` - Entry point, uses ES module imports with importmap for Excalibur

## Important Notes

- The project uses Excalibur 0.30.0 specifically (see git history for version issues)
- No build step - uses native ES modules with live-server for development
- Camera is locked to follow the boat (configured in `Boat.onInitialize`)
- Wind particles emission window is locked to the camera so that new particles are always emitted within the camera's view
