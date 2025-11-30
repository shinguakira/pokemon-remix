/**
 * Map interfaces for Tiled map support
 */

// =============================================================================
// Map Interfaces
// =============================================================================

export interface SpawnPoint {
  name: string;
  x: number;
  y: number;
}

export interface TiledLayer {
  name: string;
  type: "tilelayer" | "objectgroup";
  data?: number[];
  objects?: TiledObject[];
  width?: number;
  height?: number;
}

export interface TiledObject {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TiledMapData {
  layers: TiledLayer[];
  tilewidth: number;
  tileheight: number;
  width: number;
  height: number;
}
