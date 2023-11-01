export const resetDefensesCounterHook = () => {
  const gameCombatants = game.combat.combatants.map(c => c.token);
  const combatantsAcc = gameCombatants.filter(
    i => i.actor.flags.animabf?.defensesCounter?.accumulated !== 0
  );
  if (combatantsAcc.length !== 0) {
    for (let combantantAcc of combatantsAcc) {
      combantantAcc.actor.resetDefensesCounter();
    }
  }
};
