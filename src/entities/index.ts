// Base classes
export { Entity } from "./Entity";
export { AnimatedEntity } from "./AnimatedEntity";
export { Character, Player, NPC } from "./Character";

// Game entities
export {
  Pokemon,
  PokemonRegistry,
  createPokemon,
  registerPokemon,
} from "./Pokemon";
export { Camera } from "./Camera";
export { DialogBox } from "./DialogBox";
export { Collidable } from "./Collidable";
export { TiledMap } from "./TiledMap";

// Config interfaces are in core/interfaces
