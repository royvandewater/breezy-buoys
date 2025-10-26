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
import { TerrainGenerator } from "./terrainGenerator.js";

/**
 * Manages infinite terrain generation by creating and destroying chunks
 * as the boat moves through the world.
 */
export class ChunkManagerSystem extends System {
  // Chunk configuration
  static chunkSize = 1024; // pixels per chunk (after scaling)
  static chunkTextureSize = 512; // texture resolution
  static viewDistance = 3; // chunks in each direction (increased for earlier loading)
  static scale = 3;
  static threshold = 0.25; // Threshold for the perlin noise to determine if the pixel is ocean or beach. Lower numbers mean more land.
  static seed = 12345;
  static maxChunksPerFrame = 4; // Can process multiple since worker is non-blocking

  systemType = SystemType.Update;

  constructor() {
    super();
    // Map of chunk coordinates to WorldMap actors
    // Key format: "x,y" where x and y are chunk coordinates
    this.chunks = new Map();
    // Queue of chunks waiting to be generated
    this.pendingChunks = [];
    // Set of chunks currently being generated in worker
    this.generatingChunks = new Set();
    this.lastBoatChunkX = null;
    this.lastBoatChunkY = null;
    // Initialize terrain generator with worker
    this.terrainGenerator = new TerrainGenerator();
  }

  initialize(world) {
    this.world = world;
    this.boatQuery = world.query([TransformComponent, BoatComponent]);
  }

  destroy() {
    // Clean up worker on system destroy
    if (this.terrainGenerator) {
      this.terrainGenerator.terminate();
    }
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
      // Still process pending chunks even if boat hasn't moved chunks
      this.processPendingChunks();
      return;
    }

    this.lastBoatChunkX = boatChunkX;
    this.lastBoatChunkY = boatChunkY;

    // Determine which chunks should exist
    const requiredChunks = new Set();
    const viewDist = ChunkManagerSystem.viewDistance;

    for (let cx = boatChunkX - viewDist; cx <= boatChunkX + viewDist; cx++) {
      for (let cy = boatChunkY - viewDist; cy <= boatChunkY + viewDist; cy++) {
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

    // Queue new chunks that are needed (prioritize by distance to boat)
    const newChunks = [];
    for (const key of requiredChunks) {
      if (
        !this.chunks.has(key) &&
        !this.pendingChunks.includes(key) &&
        !this.generatingChunks.has(key)
      ) {
        newChunks.push(key);
      }
    }

    // Sort by distance to boat (closest first)
    newChunks.sort((a, b) => {
      const [ax, ay] = a.split(",").map(Number);
      const [bx, by] = b.split(",").map(Number);
      const distA = Math.abs(ax - boatChunkX) + Math.abs(ay - boatChunkY);
      const distB = Math.abs(bx - boatChunkX) + Math.abs(by - boatChunkY);
      return distA - distB;
    });

    // Add to pending queue
    this.pendingChunks.push(...newChunks);

    // Process some chunks this frame
    this.processPendingChunks();
  }

  /**
   * Process a limited number of pending chunks per frame
   * Now uses async worker generation, so we can kick off multiple at once
   */
  processPendingChunks() {
    const chunksToGenerate = Math.min(
      ChunkManagerSystem.maxChunksPerFrame,
      this.pendingChunks.length
    );

    for (let i = 0; i < chunksToGenerate; i++) {
      const key = this.pendingChunks.shift();
      if (key && !this.chunks.has(key) && !this.generatingChunks.has(key)) {
        const [cx, cy] = key.split(",").map(Number);
        this.createChunkAsync(cx, cy);
      }
    }
  }

  /**
   * Creates a chunk at the given chunk coordinates using async worker
   * @param {number} chunkX - Chunk X coordinate
   * @param {number} chunkY - Chunk Y coordinate
   */
  async createChunkAsync(chunkX, chunkY) {
    const key = `${chunkX},${chunkY}`;

    // Mark as generating
    this.generatingChunks.add(key);

    try {
      // Generate terrain in background worker (non-blocking!)
      const base64BitMap = await this.terrainGenerator.generateChunk({
        size: ChunkManagerSystem.chunkTextureSize,
        scale: ChunkManagerSystem.scale,
        threshold: ChunkManagerSystem.threshold,
        offsetX: chunkX,
        offsetY: chunkY,
        seed: ChunkManagerSystem.seed,
      });

      // Check if chunk is still needed (boat might have moved far away)
      if (!this.chunks.has(key)) {
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
        await imageSource.load();
        chunk.pos = vec(worldX, worldY);
        this.world.entityManager.addEntity(chunk);

        // Store chunk reference
        this.chunks.set(key, chunk);
      }
    } catch (error) {
      console.error(`Failed to generate chunk ${key}:`, error);
    } finally {
      // Remove from generating set
      this.generatingChunks.delete(key);
    }
  }
}
