// @ts-nocheck
export default class abfCombat extends Combat {
  async nextRound() {
    // Reset initiative for everyone when going to the next round
    this.resetAll();

    super.nextRound();
  }
}
