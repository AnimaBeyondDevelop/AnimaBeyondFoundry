export const mysticCanCastEvaluate = (actor, spell, spellGrade) => {
  const canCast = { prepared: false, innate: false };
  canCast.prepared =
    actor.system.mystic.preparedSpells.find(
      ps => ps.name == spell.name && ps.system.grade.value == spellGrade
    )?.system.prepared.value ?? false;
  const spellVia = spell?.system.via.value;
  const innateMagic = actor.system.mystic.innateMagic;
  const innateVia = innateMagic.via.find(i => i.name == spellVia);
  const innateMagicValue =
    innateMagic.via.length !== 0 && innateVia
      ? innateVia.system.final.value
      : innateMagic.main.final.value;
  canCast.innate = innateMagicValue >= spell?.system.grades[spellGrade].zeon.value;
  return canCast;
};
