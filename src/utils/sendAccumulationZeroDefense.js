import { Templates } from '../module/utils/constants';
import { ABFDefenseData } from '../module/combat/ABFDefenseData';
import { computeCombatResult } from '../module/combat/computeCombatResult';
import { updateAttackTargetsFlag } from './updateAttackTargetsFlag.js';
import { getChatVisibilityOptions } from '../module/utils/chatVisibility.js';

export async function sendAccumulationZeroDefense({
  defenderToken,
  attackerToken,
  attackData,
  messageId,
  storedTokenKey = ''
}) {
  const actor = defenderToken?.actor;
  if (!actor) return;

  const actorUuid = actor.uuid ?? '';
  const tokenUuid =
    storedTokenKey ||
    defenderToken.document?.uuid ||
    defenderToken.uuid ||
    defenderToken.id ||
    '';

  if (messageId) {
    await updateAttackTargetsFlag(messageId, {
      actorUuid,
      tokenUuid,
      state: 'rolling',
      rolledBy: game.user.id,
      updatedAt: Date.now()
    });
  }

  const vis = getChatVisibilityOptions();

  const armorType = attackData?.armorType;
  const taFinal =
    armorType != null ? actor.system?.combat?.totalArmor?.at?.[armorType]?.value ?? 0 : 0;

  const defenseData = ABFDefenseData.builder()
    .defenseAbility(0)
    .armor(taFinal)
    .inmodifiableArmor(false)
    .defenseType('resistance')
    .defenderId(actor.id)
    .defenderTokenId(defenderToken?.id ?? '')
    .weaponId('')
    .shieldId('')
    .build();

  const combatResult = computeCombatResult(attackData, defenseData);

  const damageFinal = Number(
    combatResult?.damageFinal ??
      combatResult?.damage?.final ??
      combatResult?.finalDamage ??
      combatResult?.damage ??
      0
  );

  const tokenName = defenderToken?.name ?? defenderToken?.document?.name ?? actor.name;
  const speaker = {
    ...ChatMessage.getSpeaker({ token: defenderToken }),
    alias: tokenName
  };

  const content = await renderTemplate(Templates.Chat.CombatResult, {
    combatResult: { ...combatResult, damageFinal },
    defenderId: actor.id,
    defenderTokenId: defenderToken?.id ?? ''
  });

  await ChatMessage.create({
    content,
    speaker,
    ...vis,
    flags: {
      animabf: {
        kind: 'combatResult',
        result: { ...combatResult, damageFinal },
        defender: { actorId: actor.id, tokenId: defenderToken?.id ?? '' },
        damageControl: { appliedOnce: false, apps: [] }
      }
    }
  });

  if (messageId) {
    await updateAttackTargetsFlag(messageId, {
      actorUuid,
      tokenUuid,
      state: 'done',
      rolledBy: game.user.id,
      defenseResult: defenseData.toJSON?.() ?? defenseData,
      updatedAt: Date.now()
    });
  }
}
