export const resetDefensesCounterHook = combatStart => {
  const gameCombatants = game.combat.combatants.map(c => c.token);
  const combatantsAcc = gameCombatants.filter(
    i => i.actor.flags.world?.[i.actorId]?.defensesCounter?.accumulated !== 0
  );
  if (combatantsAcc.length !== 0) {
    for (let combantantAcc of combatantsAcc) {
      combantantAcc.actor.resetDefensesCounter();
      if (
        combatStart &&
        combantantAcc.actor.flags?.world?.[combantantAcc.actorId]?.defensesCounter
          ?.value == undefined
      ) {
        combantantAcc.actor.update({
          flags: {
            world: {
              [`${combantantAcc.actorId}.defensesCounter`]: { value: true }
            }
          }
        });
      }
    }
  }
};
