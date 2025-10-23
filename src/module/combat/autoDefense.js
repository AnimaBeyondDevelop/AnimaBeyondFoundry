import { ABFDefenseData } from './ABFDefenseData.js';
import { AbilityData } from '../types/AbilityData.js';
import ABFFoundryRoll from '../rolls/ABFFoundryRoll.js';
import { computeCombatResult } from './computeCombatResult.js';

/**
 * Auto-pick best defense (block vs dodge), roll it, post the roll
 * and return the full computed defense package.
 *
 * @param {object} params
 * @param {Token|null}   params.defenderToken  Token instance (preferred)
 * @param {Actor|null}   params.defenderActor  Actor (used if no token)
 * @param {object}       params.attackData     Serialized ABFAttackData
 * @param {number|string|null|undefined} [params.defenseMod=0] - Extra modifier added to the defense roll.
 *   Accepted types: number, numeric string, '', null, undefined. Non-numeric → 0.
 * @returns {Promise<object>} Defense result payload
 */
export async function autoRollDefenseAgainstAttack({
  defenderToken = null,
  defenderActor = null,
  attackData,
  defenseMod = 0
}) {
  const actor = defenderActor ?? defenderToken?.actor ?? null;
  if (!actor) throw new Error('autoRollDefenseAgainstAttack: defender actor missing');

  // --- helpers ---
  /** @param {*} v */
  const toSafeNumber = v => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };
  const safeMod = toSafeNumber(defenseMod);

  // --- Choose best option: BLOCK (best weapon) vs DODGE ---
  const weapons = actor.system?.combat?.weapons ?? [];
  const bestWeapon = weapons.reduce((best, w) => {
    const cand = Number(w?.system?.block?.final?.value ?? -Infinity);
    const cur = Number(best?.system?.block?.final?.value ?? -Infinity);
    return cand > cur ? w : best;
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
      ? actor.system?.general?.diceSettings?.abilityMasteryDie?.value ?? '1d100xa'
      : actor.system?.general?.diceSettings?.abilityDie?.value ?? '1d100xa';

  const staticBonus = finalBase;
  // Include safeMod in the formula so chat shows the actual total
  const formula = `${die} + ${staticBonus} + ${safeMod}`;

  const roll = new ABFFoundryRoll(formula, actor.system);
  await roll.evaluate({ async: true });

  // --- Post the roll using token speaker + alias = token name ---
  const rollMode =
    game.settings?.get?.('core', 'rollMode') ?? CONST.DICE_ROLL_MODES.PUBLIC;
  const flavorKey =
    defenseType === 'block'
      ? 'chat.defense.autoRollFlavor.block'
      : 'chat.defense.autoRollFlavor.dodge';
  const flavor = game.i18n?.localize?.(flavorKey) || `Auto Defense — ${defenseType}`;

  const tokenName = defenderToken?.name ?? defenderToken?.document?.name ?? actor.name;
  const speaker = defenderToken
    ? { ...ChatMessage.getSpeaker({ token: defenderToken }), alias: tokenName }
    : ChatMessage.getSpeaker({ actor });

  await roll.toMessage({ speaker, flavor, rollMode });

  // --- Build defense data (TA depends on attack's armorType) ---
  const armorType = attackData?.armorType;
  const taFinal =
    armorType != null ? actor.system?.combat?.totalArmor?.at?.[armorType]?.value ?? 0 : 0;

  const defenseData = ABFDefenseData.builder()
    .defenseAbility(roll.total) // roll already includes safeMod
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
    defenseTotal: roll.total, // includes safeMod
    weaponId: bestWeapon?._id ?? '',
    defenseData,
    combatResult
  };
}
