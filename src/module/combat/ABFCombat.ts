import { openModDialog } from '../utils/dialogs/openSimpleInputDialog';

export default class ABFCombat extends Combat {
  constructor(
    data: ConstructorParameters<typeof foundry.documents.BaseCombat>[0],
    context: ConstructorParameters<typeof foundry.documents.BaseCombat>[1]
  ) {
    super(data, context);
    this.setFlag('world', 'newRound', true);
  }

  async nextTurn() {
    if (this.getFlag('world', 'newRound')) {
      this.setFlag('world', 'newRound', false);
    }
    return super.nextTurn();
  }

  async nextRound() {
    // Reset initiative for everyone when going to the next round
    await this.resetAll();
    this.setFlag('world', 'newRound', true);

    return super.nextRound();
  }

  prepareDerivedData() {
    super.prepareDerivedData();

    this.combatants.forEach(combatant => {
      combatant.actor?.prepareDerivedData();
    });
  }

  // Modify rollInitiative so that it asks for modifiers
  async rollInitiative(ids: string[] | string, { updateTurn = false, messageOptions }: any = {}): Promise<this> {
    const mod = await openModDialog();

    if (typeof ids === 'string') {
      ids = [ids];
    }
    for (const id of ids) {
      const combatant = this.combatants.get(id);

      await super.rollInitiative(id, {
        formula: `1d100Initiative + ${combatant?.actor?.system.characteristics.secondaries.initiative.final.value} + ${mod}`,
        updateTurn,
        messageOptions
      });
    }

    if (this.getFlag('world', 'newRound')) {
      await this.update({ turn: 0 }); // Updates active turn such that it is the one with higher innitiative.
    }

    return this;
  }

  protected override _sortCombatants(
    a: Combatant,
    b: Combatant
  ): number {
    let initiativeA = a.initiative || -9999;
    let initiativeB = b.initiative || -9999;
    if (initiativeA < (a?.actor?.system.characteristics.secondaries.initiative.final.value || 0)) initiativeA -= 2000;
    if (initiativeB < (b?.actor?.system.characteristics.secondaries.initiative.final.value || 0)) initiativeB -= 2000;
    return initiativeB - initiativeA;
  }
}
