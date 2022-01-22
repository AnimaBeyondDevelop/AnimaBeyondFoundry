import type { InitiativeOptions } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/foundry.js/clientDocuments/combat';
import { openModDialog } from '../utils/dialogs/openSimpleInputDialog';

export default class ABFCombat extends Combat {
  async nextRound() {
    // Reset initiative for everyone when going to the next round
    await this.resetAll();

    return super.nextRound();
  }

  prepareDerivedData() {
    super.prepareDerivedData();

    this.combatants.forEach(combatant => {
      combatant.actor?.prepareDerivedData();
    });
  }

  // Modify rollInitiative so that it asks for modifiers
  async rollInitiative(ids: string[] | string, { updateTurn = false, messageOptions }: InitiativeOptions = {}): Promise<this> {
    const mod = await openModDialog();

    if (typeof ids === 'string') {
      ids = [ids];
    }
    for (const id of ids) {
      const combatant = this.data.combatants.get(id);

      await super.rollInitiative(id, {
        formula: `1d100xaturn + ${combatant?.actor?.data.data.characteristics.secondaries.initiative.final.value} + ${mod}`,
        updateTurn,
        messageOptions
      });
    }

    return this;
  }
}
