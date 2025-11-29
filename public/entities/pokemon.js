/**
 * Creates a new Pokemon object.
 * @param {object} config
 * @param {string} config.name
 * @param {number} config.level
 * @param {number} config.maxHp
 * @param {number} config.attack
 * @param {number} config.defense
 * @param {Array<{name: string, power: number}>} config.moves
 * @returns {object} A Pokemon object.
 */
export function makePokemon(config) {
  const pokemon = {
    name: config.name,
    level: config.level,
    maxHp: config.maxHp,
    currentHp: config.maxHp,
    attack: config.attack,
    defense: config.defense,
    moves: config.moves,
    isFainted: false,

    /**
     * Calculates the damage to be dealt to a target Pokemon.
     * @param {object} target The Pokemon to attack.
     * @param {object} move The move to use.
     * @returns {number} The calculated damage.
     */
    calculateDamage(target, move) {
      // This is a simplified damage formula for demonstration
      const damage = Math.floor(
        (((2 * this.level) / 5 + 2) * move.power * (this.attack / target.defense)) / 50
      ) + 2;
      return damage;
    },

    /**
     * Reduces the Pokemon's HP by a given amount.
     * @param {number} amount The amount of damage to take.
     */
    takeDamage(amount) {
      this.currentHp -= amount;
      if (this.currentHp <= 0) {
        this.currentHp = 0;
        this.isFainted = true;
        console.log(`${this.name} has fainted!`);
      }
    },

    /**
     * Executes an attack on a target Pokemon.
     * @param {object} target The Pokemon to attack.
     * @param {number} moveIndex The index of the move to use from the moves array.
     */
    attackMove(target, moveIndex) {
      const move = this.moves[moveIndex];
      if (!move) {
        console.error(`Move at index ${moveIndex} not found for ${this.name}`);
        return;
      }

      console.log(`${this.name} used ${move.name}!`);
      const damage = this.calculateDamage(target, move);
      target.takeDamage(damage);
      console.log(`${target.name} took ${damage} damage.`);
    },
  };

  return pokemon;
}