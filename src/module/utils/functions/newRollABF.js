import ABFFoundryRoll from '../../rolls/ABFFoundryRoll';
import { openModDialog } from '../dialogs/openSimpleInputDialog';
import { psychicFatigue } from '../../combat/utils/psychicFatigue.js';
import { psychicImbalanceCheck } from '../../combat/utils/psychicImbalanceCheck.js';
import { psychicPotentialEffect } from '../../combat/utils/psychicPotentialEffect.js';
import { shieldBaseValueCheck } from '../../combat/utils/shieldBaseValueCheck.js';
import { shieldValueCheck } from '../../combat/utils/shieldValueCheck.js';

//abilityPath is a String example "secondaries.notice"
//abilityValue is a Number, expected final value of secondary
//actor is the actor object

export const newRollABF = async (abilityPath, abilityValue, actor) => {
  const name = game.i18n.localize(`anima.ui.${abilityPath}.title`);
  const label = name ? `Rolling ${name}` : '';
  const mod = await openModDialog();
  let formula = `1d100xa + ${abilityValue} + ${mod ?? 0}`;
  if (abilityValue >= 200) formula = formula.replace('xa', 'xamastery');
  const roll = new ABFFoundryRoll(formula, actor.system);
  roll.roll();
  roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: label
  });
  return roll.total;
};

export const newPsychicRollABF = async (power, actor) => {
  const { inhuman, zen } = actor.system.general.settings;
  const { i18n } = game;
  const mod = await openModDialog();
  const psychicPotential = {
    base: actor.system.psychic.psychicPotential.base.value,
    final:
      actor.system.psychic.psychicPotential.final.value + power?.system.bonus.value ?? 0
  };
  let fatigueCheck, supShield;

  const psychicPotentialRoll = new ABFFoundryRoll(
    `1d100xa + ${psychicPotential.final} + ${mod}`,
    actor.system
  );
  psychicPotentialRoll.roll();
  let imbalance = psychicImbalanceCheck(actor, power) ?? 0;
  const newPotentialBase = psychicPotentialEffect(
    psychicPotential.base,
    0,
    inhuman.value,
    zen.value
  );
  const newPotentialTotal = psychicPotentialEffect(
    psychicPotentialRoll.total,
    imbalance,
    inhuman.value,
    zen.value
  );
  const baseEffect = shieldBaseValueCheck(newPotentialBase, power?.system.effects);
  const finalEffect = shieldValueCheck(
    power?.system.effects[newPotentialTotal].value ?? ''
  );
  const fatigueInmune = actor.system.general.advantages.find(
    i => i.name === 'Res. a la fatiga psíquica'
  );
  fatigueCheck = psychicFatigue(
    power?.system.effects[newPotentialTotal].value,
    fatigueInmune
  );
  const fatiguePen = fatigueCheck[1];
  const overmantained = baseEffect[0] >= finalEffect[0];

  if (fatigueCheck[0]) {
    psychicPotentialRoll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: i18n.format('macros.combat.dialog.psychicPotentialFatigue.title', {
        fatiguePen
      })
    });
    actor.applyFatigue(fatiguePen);
  } else {
    supShield = {
      name: power.name,
      system: {
        overmantained,
        damageBarrier: { value: 0 },
        shieldPoints: {
          value: finalEffect[0],
          maintainMax: baseEffect[0]
        }
      },
      create: true
    };
    psychicPotentialRoll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: i18n.format('macros.combat.dialog.psychicPotential.title')
    });
    return supShield;
  }
  return;
};
