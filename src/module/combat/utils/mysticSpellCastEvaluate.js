export const mysticSpellCastEvaluate = (actor, spell, spellGrade) => {
  const mysticSpellCheck = { prepared: false, innate: false };
  mysticSpellCheck.prepared =
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
  mysticSpellCheck.innate =
    innateMagicValue >= spell?.system.grades[spellGrade].zeon.value;
  return mysticSpellCheck;
};
