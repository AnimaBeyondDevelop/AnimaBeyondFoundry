import { ABFSupernaturalShieldData } from '../../combat/ABFSupernaturalShieldData.js';
import { shieldValueCheck } from '../../combat/utils/shieldValueCheck.js';

const DEFENSIVE_PROJECTION_FORMULA =
  '@mystic.magicProjection.imbalance.defensive.final.value';

export function localizeMysticSpellGrade(grade) {
  return game.i18n.localize(`anima.ui.mystic.spell.grade.${grade}.title`);
}

export function getMysticShieldName(spell, grade) {
  return `${spell.name} (${localizeMysticSpellGrade(grade)})`;
}

export function getMysticShieldPoints(spell, grade) {
  const gradeData = spell?.system?.grades?.[grade];
  return Number(shieldValueCheck(gradeData)) || 0;
}

export function buildMysticDefenseShieldAbilityFormula(formulaBonus = 0) {
  if (formulaBonus !== 0) {
    return `${DEFENSIVE_PROJECTION_FORMULA} + ${formulaBonus}`;
  }
  return DEFENSIVE_PROJECTION_FORMULA;
}

export function buildMysticDefenseShieldData({ spell, grade, formulaBonus = 0 }) {
  return ABFSupernaturalShieldData.builder()
    .name(getMysticShieldName(spell, grade))
    .shieldPoints(getMysticShieldPoints(spell, grade))
    .abilityFormula(buildMysticDefenseShieldAbilityFormula(formulaBonus))
    .flags({ animabf: { supernaturalShield: { type: 'mystic' } } })
    .build();
}

export async function castMysticDefenseShield({ actor, spell, grade, formulaBonus = 0 }) {
  const shieldName = getMysticShieldName(spell, grade);

  await actor.newSupernaturalShield(
    buildMysticDefenseShieldData({ spell, grade, formulaBonus })
  );

  ui.notifications?.info(
    game.i18n.format('anima.ui.combat.supernaturalShields.addedNotification', {
      name: shieldName
    })
  );
}
