export const criticPenaltyHook = () => {
  const gameCombatants = game.combat.combatants.map(c => c.token);
  const combatantsAcc = gameCombatants.filter(
    i =>
      i.actor.flags.world?.[i.actorId]?.criticPenalty !== undefined &&
      i.actor.flags.world?.[i.actorId]?.criticPenalty !== 0
  );
  if (combatantsAcc.length !== 0) {
    for (let combantantAcc of combatantsAcc) {
      const criticPenalty = combantantAcc.actor.flags.world?.[combantantAcc.actorId]?.criticPenalty;
      let newCriticPenalty = -5;
      if (criticPenalty > -5) {
        newCriticPenalty = criticPenalty;
      }
      combantantAcc.actor.applyCriticEffect(newCriticPenalty);
    }
  }
};
