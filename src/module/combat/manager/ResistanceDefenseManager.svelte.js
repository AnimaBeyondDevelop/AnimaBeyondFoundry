import { DefenseManager } from '@module/combat/manager/DefenseManager.svelte.js'

export class ResistanceDefenseManager extends DefenseManager {
    constructor(attacker, defender, hooks, options) {
        super(attacker, defender, hooks, options);

        this.data.surprised = false

    }

    onDefense() {

        this.hooks.onDefense({
            type: 'resistance',
            values: {
                defense: 0,
                armor: this.armor,
                roll: 0,
                surprised: this.data.surprised,
                defenderCombatMod: this.modifiers
            }
        });
    }
}