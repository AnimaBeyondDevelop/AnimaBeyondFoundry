import { ABFDefenseData } from './ABFDefenseData.js';
import { AbilityData } from '../types/AbilityData.js';
import ABFFoundryRoll from '../rolls/ABFFoundryRoll.js';
import { computeCombatResult } from './computeCombatResult.js';

export async function autoRollDefenseAgainstAttack({
  defenderToken,
  defenderActor,
  attackData
}) {
  const actor = defenderActor ?? defenderToken?.actor;
  if (!actor) throw new Error('autoRollDefenseAgainstAttack: defender actor missing');

  // --- pick best option: BLOCK (best weapon) vs DODGE ---
  const weapons = actor.system?.combat?.weapons ?? [];
  const bestWeapon = weapons.reduce((best, w) => {
    const v = Number(w?.system?.block?.final?.value ?? -Infinity);
    return v > (best?.system?.block?.final?.value ?? -Infinity) ? w : best;
  }, undefined);

  const blockBase = Number(
    (bestWeapon
      ? bestWeapon.system?.block?.base?.value
      : actor.system?.combat?.block?.base?.value) ?? 0
  );
  const blockFinal = Number(
    (bestWeapon
      ? bestWeapon.system?.block?.final?.value
      : actor.system?.combat?.block?.final?.value) ?? 0
  );

  const dodgeBase = Number(actor.system?.combat?.dodge?.base?.value ?? 0);
  const dodgeFinal = Number(actor.system?.combat?.dodge?.final?.value ?? 0);

  const chooseBlock = blockFinal >= dodgeFinal; // tie → block
  const defenseType = chooseBlock ? 'block' : 'dodge';

  const naturalBase = chooseBlock ? blockBase : dodgeBase;
  const finalBase = chooseBlock ? blockFinal : dodgeFinal;

  const die =
    naturalBase >= 200
      ? actor.system?.general?.diceSettings?.abilityMasteryDie?.value ?? '1d100'
      : actor.system?.general?.diceSettings?.abilityDie?.value ?? '1d100';

  const staticBonus = finalBase; // no extra modifiers in auto mode
  const formula = `${die} + ${staticBonus}`;

  const roll = new ABFFoundryRoll(formula, actor.system);
  await roll.evaluate({ async: true });

  // === NUEVO: publicar la tirada con el mismo rollMode que la defensa normal ===
  const rollMode =
    game.settings?.get?.('core', 'rollMode') ?? CONST.DICE_ROLL_MODES.PUBLIC;
  const flavorKey =
    defenseType === 'block'
      ? 'chat.defense.autoRollFlavor.block'
      : 'chat.defense.autoRollFlavor.dodge';
  const flavor = game.i18n?.localize?.(flavorKey) || `Auto Defense — ${defenseType}`;

  const speaker = defenderToken
    ? ChatMessage.getSpeaker({ token: defenderToken })
    : ChatMessage.getSpeaker({ actor });

  await roll.toMessage({ speaker, flavor, rollMode });

  // Armor vs attack's armorType
  const armorType = attackData?.armorType;
  const taFinal =
    armorType != null ? actor.system?.combat?.totalArmor?.at?.[armorType]?.value ?? 0 : 0;

  // Build defense data
  const defenseData = ABFDefenseData.builder()
    .defenseAbility(roll.total)
    .armor(taFinal)
    .inmodifiableArmor(false)
    .defenseType(defenseType)
    .defenderId(actor.id)
    .defenderTokenId(defenderToken?.id ?? '')
    .weaponId(bestWeapon?._id ?? '')
    .build();

  const combatResult = computeCombatResult(attackData, defenseData);

  return {
    actor,
    token: defenderToken ?? null,
    defenseType,
    defenseTotal: roll.total,
    weaponId: bestWeapon?._id ?? '',
    defenseData,
    combatResult
  };
}
