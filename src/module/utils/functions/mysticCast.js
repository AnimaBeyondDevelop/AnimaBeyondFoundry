export const mysticCast = (actor, spellCasting, spellName, spellGrade) => {
  const { zeon, cast, override } = spellCasting;
  if (override.value) {
    return;
  }
  if (cast.innate) {
    return;
  }
  if (cast.prepared) {
    actor.deletePreparedSpell(spellName, spellGrade);
  } else {
    actor.consumeAccumulatedZeon(zeon.cost);
  }
};
