import type p5 from "p5";
import type {
  P5Instance,
  TiledMapData,
  SpawnPoint,
  FramePosition,
  IDrawable,
  TiledMapConfig,
} from "../core/interfaces";
import { getFramePositions, drawTile } from "../core/utils";
import { Collidable } from "./Collidable";
import { Camera } from "./Camera";

/**
 * Tiled map renderer.
 * Loads and renders maps exported from Tiled map editor.
 */
export class TiledMap implements IDrawable {
  // Position offset
  x: number;
  y: number;

  // Tile dimensions
  private tileWidth: number;
  private tileHeight: number;

  // Assets
  private mapImage: p5.Image | null = null;
  private tiledData: TiledMapData | null = null;
  private tilesetUrl: string = "";
  private mapDataUrl: string = "";

  // Processed data
  private tilesPos: FramePosition[] = [];
  private boundaries: Collidable[] = [];
  private spawnPoints: SpawnPoint[] = [];

  // Debug
  private showDebug: boolean = false;

  // Loading state
  private isLoaded: boolean = false;

  constructor(config: TiledMapConfig) {
    this.x = config.x;
    this.y = config.y;
    this.tileWidth = config.tileWidth ?? 32;
    this.tileHeight = config.tileHeight ?? 32;
  }

  /**
   * Load map assets
   */
  async load(
    p: P5Instance,
    tilesetUrl: string,
    mapDataUrl: string
  ): Promise<void> {
    this.tilesetUrl = tilesetUrl;
    this.mapDataUrl = mapDataUrl;
    this.isLoaded = false;

    // Load tileset image with callback
    this.mapImage = p.loadImage(
      tilesetUrl,
      () => {
        console.log("Map tileset loaded");
      },
      (err) => {
        console.error("Failed to load map tileset:", err);
      }
    ) as unknown as p5.Image;

    // Load map data
    try {
      const response = await fetch(mapDataUrl);
      this.tiledData = await response.json();

      this.prepareTiles();
      this.extractSpawnPoints();
      this.extractBoundaries();
      this.isLoaded = true;
    } catch (e) {
      console.error("Failed to load map data:", e);
    }
  }

  /**
   * Prepare tile positions from tileset
   */
  private prepareTiles(): void {
    // Assume 8 columns and 55 rows for this tileset (adjust as needed)
    this.tilesPos = getFramePositions(8, 55, this.tileWidth, this.tileHeight);
  }

  /**
   * Extract spawn points from map data
   */
  private extractSpawnPoints(): void {
    if (!this.tiledData) return;

    for (const layer of this.tiledData.layers) {
      if (layer.name === "SpawnPoints" && layer.objects) {
        this.spawnPoints = layer.objects.map((obj) => ({
          name: obj.name,
          x: obj.x,
          y: obj.y,
        }));
      }
    }
  }

  /**
   * Extract collision boundaries from map data
   */
  private extractBoundaries(): void {
    if (!this.tiledData) return;

    for (const layer of this.tiledData.layers) {
      if (
        layer.type === "objectgroup" &&
        layer.name === "Boundaries" &&
        layer.objects
      ) {
        this.boundaries = layer.objects.map(
          (obj) =>
            new Collidable({
              x: this.x + obj.x,
              y: this.y + obj.y,
              width: obj.width,
              height: obj.height,
            })
        );
      }
    }
  }

  /**
   * Get spawn points from map
   */
  getSpawnPoints(): SpawnPoint[] {
    return this.spawnPoints;
  }

  /**
   * Get spawn point by name
   */
  getSpawnPoint(name: string): SpawnPoint | undefined {
    return this.spawnPoints.find((sp) => sp.name === name);
  }

  /**
   * Get world position for a spawn point
   */
  getSpawnPosition(name: string): { x: number; y: number } | undefined {
    const spawnPoint = this.getSpawnPoint(name);
    if (!spawnPoint) return undefined;

    return {
      x: this.x + spawnPoint.x,
      y: this.y + spawnPoint.y + this.tileHeight,
    };
  }

  /**
   * Check and resolve collisions for an entity
   */
  handleCollisions(entity: {
    x: number;
    y: number;
    width: number;
    height: number;
  }): void {
    for (const boundary of this.boundaries) {
      boundary.preventPassthroughFrom(entity);
    }
  }

  /**
   * Enable debug mode
   */
  setDebug(enabled: boolean): void {
    this.showDebug = enabled;
    for (const boundary of this.boundaries) {
      boundary.setDebug(enabled);
    }
  }

  /**
   * Draw the map
   */
  draw(p: P5Instance, camera?: Camera): void {
    // Check if fully loaded
    if (
      !this.isLoaded ||
      !this.tiledData ||
      !this.mapImage ||
      this.mapImage.width === 0
    )
      return;

    const cameraX = camera?.x ?? 0;
    const cameraY = camera?.y ?? 0;

    // Draw tile layers
    for (const layer of this.tiledData.layers) {
      if (layer.type === "tilelayer" && layer.data) {
        this.drawTileLayer(p, layer.data, layer.width ?? 0, cameraX, cameraY);
      }
    }

    // Update and draw boundaries (for collision handling and debug)
    for (const boundary of this.boundaries) {
      boundary.updateScreenPosition(cameraX, cameraY);
      if (this.showDebug) {
        boundary.draw(p);
      }
    }
  }

  /**
   * Draw a single tile layer
   */
  private drawTileLayer(
    p: P5Instance,
    data: number[],
    layerWidth: number,
    cameraX: number,
    cameraY: number
  ): void {
    let currentX = this.x;
    let currentY = this.y;
    let tilesDrawn = 0;

    for (const tileIndex of data) {
      // Move to next row
      if (tilesDrawn > 0 && tilesDrawn % layerWidth === 0) {
        currentX = this.x;
        currentY += this.tileHeight;
      }

      // Skip empty tiles
      if (tileIndex !== 0) {
        const tilePos = this.tilesPos[tileIndex - 1];
        if (tilePos) {
          drawTile(
            p,
            this.mapImage!,
            Math.round(currentX + cameraX),
            Math.round(currentY + cameraY),
            tilePos.x,
            tilePos.y,
            this.tileWidth,
            this.tileHeight
          );
        }
      }

      currentX += this.tileWidth;
      tilesDrawn++;
    }
  }
}
