export const resetDefensesCounterHook = () => {
  const gameCombatants = game.combat.combatants.map(c => c.token)
  const combatantsAcc = gameCombatants.filter(i => i.actor.flags.world[i.actor._id].defensesCounter.accumulated !== 0)
  if (combatantsAcc.length !== 0) {
    for (let combantantAcc of combatantsAcc) {
      combantantAcc.actor.resetDefensesCounter()
    }
  };
}