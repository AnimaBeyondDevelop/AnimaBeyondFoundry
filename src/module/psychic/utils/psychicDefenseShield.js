import { ABFSupernaturalShieldData } from '../../combat/ABFSupernaturalShieldData.js';
import { shieldValueCheck } from '../../combat/utils/shieldValueCheck.js';

const DEFENSIVE_PROJECTION_FORMULA =
  '@psychic.psychicProjection.imbalance.defensive.final.value';

export function resolvePsychicEffectAtKey(power, potentialOrKey) {
  const key = String(potentialOrKey);
  const effectData =
    power?.system?.effects?.[potentialOrKey] ?? power?.system?.effects?.[key] ?? null;

  return {
    potential: Number(key),
    difficultyKey: key,
    effectData,
    effectText: effectData?.value ?? ''
  };
}

export function getPsychicShieldPointsFromEffect(effectData) {
  return Number(shieldValueCheck(effectData) ?? 0) || 0;
}

export function getPsychicShieldPoints(power, potentialOrKey) {
  const { effectData } = resolvePsychicEffectAtKey(power, potentialOrKey);
  return getPsychicShieldPointsFromEffect(effectData);
}

export function getPsychicShieldName(power, { difficultyKey, potential } = {}) {
  const label = difficultyKey ?? potential;
  return `${power.name} (${label})`;
}

export function buildPsychicDefenseShieldData({
  power,
  difficultyKey,
  potential,
  effectData
}) {
  return ABFSupernaturalShieldData.builder()
    .name(getPsychicShieldName(power, { difficultyKey, potential }))
    .shieldPoints(getPsychicShieldPointsFromEffect(effectData))
    .abilityFormula(DEFENSIVE_PROJECTION_FORMULA)
    .flags({ animabf: { supernaturalShield: { type: 'psychic' } } })
    .build();
}

export async function castPsychicDefenseShield({
  actor,
  power,
  difficultyKey,
  potential,
  effectData
}) {
  const shieldName = getPsychicShieldName(power, { difficultyKey, potential });

  await actor.newSupernaturalShield(
    buildPsychicDefenseShieldData({ power, difficultyKey, potential, effectData })
  );

  ui.notifications?.info(
    game.i18n.format('anima.ui.combat.supernaturalShields.addedNotification', {
      name: shieldName
    })
  );
}
