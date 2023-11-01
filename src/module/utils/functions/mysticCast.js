export const mysticCast = (actor, spellCasting, spellName, spellGrade) => {
  const { zeon, casted, override } = spellCasting;
  if (override.value) {
    return;
  }
  if (casted.innate) {
    return;
  }
  if (casted.prepared) {
    actor.deletePreparedSpell(spellName, spellGrade);
  } else {
    actor.consumeAccumulatedZeon(zeon.cost);
  }
};
