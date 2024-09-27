import { DefenseManager } from '@module/combat/manager/DefenseManager.svelte.js'
import { rollToMessageFlavor } from '@module/combat/utils/rollToMessageFlavor.js'
import ABFFoundryRoll from '@module/rolls/ABFFoundryRoll';

export class ResistanceDefenseManager extends DefenseManager {
    constructor(attacker, defender, hooks, options) {
        super(attacker, defender, hooks, options);

        this.data.surprised = false

    }

    onDefense() {

        this.hooks.onDefense({
            type: 'resistance',
            values: {
                at: this.armor,
                total: 0,
                surprised: this.data.surprised,
                defenderCombatMod: this.modifiers
            }
        });
    }
}