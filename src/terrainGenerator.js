import { Color } from "excalibur";
import { Colors } from "./colors.js";

/**
 * Wrapper class for communicating with terrain generation worker
 */
export class TerrainGenerator {
  constructor() {
    this.worker = new Worker(new URL("./terrainWorker.js", import.meta.url), {
      type: "module",
    });
    this.nextId = 0;
    this.pendingRequests = new Map();

    // Handle messages from worker
    this.worker.onmessage = (e) => {
      const { id, success, data, error } = e.data;
      const request = this.pendingRequests.get(id);

      if (request) {
        this.pendingRequests.delete(id);
        if (success) {
          request.resolve(data);
        } else {
          request.reject(new Error(error));
        }
      }
    };

    this.worker.onerror = (error) => {
      console.error("Worker error:", error);
    };
  }

  /**
   * Generate a terrain chunk asynchronously in a background thread
   * @param {Object} options - Generation options
   * @returns {Promise<string>} Base64 encoded PNG image
   */
  generateChunk({
    size = 512,
    scale = 3,
    threshold = 0.25,
    offsetX = 0,
    offsetY = 0,
    seed = 0,
  } = {}) {
    return new Promise((resolve, reject) => {
      const id = this.nextId++;

      // Store the promise callbacks
      this.pendingRequests.set(id, { resolve, reject });

      // Send request to worker with color data
      this.worker.postMessage({
        id,
        data: {
          size,
          scale,
          threshold,
          offsetX,
          offsetY,
          seed,
          oceanColor: {
            r: Colors.ocean.r,
            g: Colors.ocean.g,
            b: Colors.ocean.b,
            a: 255,
          },
          beachColor: {
            r: Colors.beach.r,
            g: Colors.beach.g,
            b: Colors.beach.b,
            a: 255,
          },
        },
      });
    });
  }

  /**
   * Terminate the worker (cleanup)
   */
  terminate() {
    this.worker.terminate();
    this.pendingRequests.clear();
  }
}
