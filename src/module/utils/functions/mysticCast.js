export const mysticCast = (actor, spellCasting, zeonCost, spellName, spellGrade) => {
  if (spellCasting.cast.innate){}
  else if (spellCasting.cast.prepared){
    actor.deletePreparedSpell(spellName, spellGrade)
  } else {
    actor.consumeAccumulatedZeon(zeonCost)
  }
}
