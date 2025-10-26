import {
  ImageFiltering,
  ImageSource,
  System,
  SystemType,
  TransformComponent,
  vec,
} from "excalibur";
import { BoatComponent } from "./boat.js";
import { WorldMap } from "./worldMap.js";
import { base64BitMapFromPerlin } from "./base64BitMapFromPerlin.js";

/**
 * Manages infinite terrain generation by creating and destroying chunks
 * as the boat moves through the world.
 */
export class ChunkManagerSystem extends System {
  // Chunk configuration
  static chunkSize = 1024; // pixels per chunk (after scaling)
  static chunkTextureSize = 512; // texture resolution
  static viewDistance = 2; // chunks in each direction
  static scale = 8;
  static threshold = 0.58;
  static seed = 12345;

  systemType = SystemType.Update;

  constructor() {
    super();
    // Map of chunk coordinates to WorldMap actors
    // Key format: "x,y" where x and y are chunk coordinates
    this.chunks = new Map();
    this.lastBoatChunkX = null;
    this.lastBoatChunkY = null;
  }

  initialize(world) {
    this.world = world;
    this.boatQuery = world.query([TransformComponent, BoatComponent]);
  }

  update(_delta) {
    // Get boat position
    const boatEntities = this.boatQuery.entities;
    if (boatEntities.length === 0) return;

    const boatTransform = boatEntities[0].get(TransformComponent);
    const boatPos = boatTransform.globalPos;

    // Calculate which chunk the boat is in
    const boatChunkX = Math.floor(boatPos.x / ChunkManagerSystem.chunkSize);
    const boatChunkY = Math.floor(boatPos.y / ChunkManagerSystem.chunkSize);

    // Only update chunks if boat moved to a different chunk
    if (
      boatChunkX === this.lastBoatChunkX &&
      boatChunkY === this.lastBoatChunkY
    ) {
      return;
    }

    this.lastBoatChunkX = boatChunkX;
    this.lastBoatChunkY = boatChunkY;

    // Determine which chunks should exist
    const requiredChunks = new Set();
    const viewDist = ChunkManagerSystem.viewDistance;

    for (
      let cx = boatChunkX - viewDist;
      cx <= boatChunkX + viewDist;
      cx++
    ) {
      for (
        let cy = boatChunkY - viewDist;
        cy <= boatChunkY + viewDist;
        cy++
      ) {
        requiredChunks.add(`${cx},${cy}`);
      }
    }

    // Remove chunks that are too far away
    for (const [key, chunk] of this.chunks.entries()) {
      if (!requiredChunks.has(key)) {
        chunk.kill();
        this.chunks.delete(key);
      }
    }

    // Create new chunks that are needed
    for (const key of requiredChunks) {
      if (!this.chunks.has(key)) {
        const [cx, cy] = key.split(",").map(Number);
        this.createChunk(cx, cy);
      }
    }
  }

  /**
   * Creates a chunk at the given chunk coordinates
   * @param {number} chunkX - Chunk X coordinate
   * @param {number} chunkY - Chunk Y coordinate
   */
  createChunk(chunkX, chunkY) {
    // Generate terrain for this chunk
    const base64BitMap = base64BitMapFromPerlin({
      size: ChunkManagerSystem.chunkTextureSize,
      scale: ChunkManagerSystem.scale,
      threshold: ChunkManagerSystem.threshold,
      offsetX: chunkX,
      offsetY: chunkY,
      seed: ChunkManagerSystem.seed,
    });

    const imageSource = new ImageSource(base64BitMap, {
      filtering: ImageFiltering.Blended,
    });

    // Create WorldMap actor for this chunk
    const scaleFactor =
      ChunkManagerSystem.chunkSize / ChunkManagerSystem.chunkTextureSize;
    const chunk = new WorldMap({ imageSource, scale: scaleFactor });

    // Position the chunk at its world coordinates
    // Chunks are positioned at their center
    const worldX =
      chunkX * ChunkManagerSystem.chunkSize +
      ChunkManagerSystem.chunkSize / 2;
    const worldY =
      chunkY * ChunkManagerSystem.chunkSize +
      ChunkManagerSystem.chunkSize / 2;

    // Load and add to scene
    imageSource.load().then(() => {
      chunk.pos = vec(worldX, worldY);
      this.world.entityManager.addEntity(chunk);
    });

    // Store chunk reference
    this.chunks.set(`${chunkX},${chunkY}`, chunk);
  }
}
