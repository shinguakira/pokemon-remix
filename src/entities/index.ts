// Base classes
export { Entity } from "./Entity";
export { AnimatedEntity, type AnimatedEntityConfig } from "./AnimatedEntity";
export {
  Character,
  Player,
  NPC,
  type CharacterEntityConfig,
} from "./Character";

// Game entities
export {
  Pokemon,
  PokemonRegistry,
  createPokemon,
  registerPokemon,
} from "./Pokemon";
export { Camera, type CameraConfig } from "./Camera";
export { DialogBox, type DialogBoxConfig } from "./DialogBox";
export { Collidable, type CollidableConfig } from "./Collidable";
export { TiledMap, type TiledMapConfig } from "./TiledMap";
