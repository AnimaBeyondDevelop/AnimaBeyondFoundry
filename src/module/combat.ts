// @ts-nocheck
export default class abfCombat extends Combat {
    async nextRound() {
       // Reset initiative for everyone when going to the next round
       this.resetAll()

        // Copy-paste the original nextRound() method from foundry.js
        let turn = 0;
        if (this.settings.skipDefeated) {
            turn = this.turns.findIndex(t => {
                return !(t.defeated ||
                    t.actor?.effects.find(e => e.getFlag("core", "statusId") === CONFIG.Combat.defeatedStatusId));
            });
            if (turn === -1) {
                ui.notifications.warn(game.i18n.localize("COMBAT.NoneRemaining"));
                turn = 0;
            }
        }
        let advanceTime = Math.max(this.turns.length - this.data.turn, 1) * CONFIG.time.turnTime;
        advanceTime += CONFIG.time.roundTime;
        return this.update({ round: this.round + 1, turn: turn }, { advanceTime });
    }
}