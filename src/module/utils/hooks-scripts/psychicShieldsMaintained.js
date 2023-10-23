export const psychicShieldsMaintained = () => {
  const gameCombatants = game.combat.combatants.map(c => c.token);
  const combatantsAcc = gameCombatants.filter(
    i => i.actor.system.psychic?.psychicShields?.length !== 0
  );
  if (combatantsAcc.length == 0) {
    return;
  } else {
    for (let combantant of combatantsAcc) {
      const { psychicShields } = combantant.actor.system.psychic;
      for (let psychicShield of psychicShields) {
        if (!psychicShield.system.maintain.value) {
          const supShield = { system: psychicShield.system, id: psychicShield._id };
          combantant.actor.applyDamageSupernaturalShield(supShield, 5, false, 'psychic');
        }
      }
    }
  }
};
