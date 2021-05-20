import ABFRollProxy from './ABFRoll/ABFRollProxy';
import { openModDialog } from "./utils/openModDialog";

export default class ABFCombat extends Combat {
  async nextRound() {
    // Reset initiative for everyone when going to the next round
    await this.resetAll();

    return super.nextRound();
  }

  // Modify rollInitiative so that it asks for modifiers
  async rollInitiative(
    ids: string[] | string,
    {
      updateTurn,
      messageOptions
    }: {
      messageOptions?: DeepPartial<ChatMessage.Data & { rollMode: Const.DiceRollMode }>;
      updateTurn?: boolean;
    } = {}
  ): Promise<Combat> {
    const mod = await openModDialog();

    const formula = CONFIG.Combat.initiative.formula + `+ ${mod}`;

    return super.rollInitiative(ids, {
      formula,
      updateTurn,
      messageOptions
    });
  }
}
