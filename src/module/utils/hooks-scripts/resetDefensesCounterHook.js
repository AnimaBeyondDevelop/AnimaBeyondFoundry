export const resetDefensesCounterHook = () => {
  const gameCombatants = game.combat.combatants.map(c => c.token)
  const combatantsAcc = gameCombatants.filter(i => i.actor.system.combat.defensesCounter.value == false)
  if (combatantsAcc.length !== 0) {
    for (let combantantAcc of combatantsAcc) {
      combantantAcc.actor.resetDefensesCounter()
    }
  };
  const combatants = gameCombatants.filter(i => i.actor.system.combat.defensesCounter.accumulated > 0)
  if (combatants.length == 0) {return}
  else {
    for (let combantant of combatants) {
    combantant.actor.resetDefensesCounter()
    }
  }
}