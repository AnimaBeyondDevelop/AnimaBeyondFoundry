export const mysticCast = (actor, castInnate, castPrepared, zeonCost, spellName, spellGrade) => {
  if (castInnate){}
  else if (castPrepared){
    actor.deletePreparedSpell(spellName, spellGrade)
  } else {
    actor.consumeAccumulatedZeon(zeonCost)
  }
}
