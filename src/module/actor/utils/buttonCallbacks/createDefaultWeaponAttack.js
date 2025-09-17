import { Templates } from '../../../utils/constants';
import {ABFAttackData} from '../../../combat/ABFAttackData'
import {openModDialog} from '../../../utils/dialogs/openSimpleInputDialog.js';

export async function createDefaultWeaponAttack(sheet, e) {
  const weaponId = e.currentTarget.dataset.weaponId;
  const weapon = sheet.actor.items.get(weaponId);
  if (!weapon) { ui.notifications.warn('Arma no encontrada.'); return; }

  
  // Datos del ataque
  const label = `Rolling attack`;
  const mod = await openModDialog();

  const actor = sheet.actor;

    let baseAttack = weapon.system.attack.final.value;

    let formula = `${(actor.system.combat.attack.base.value >= 200) ? 
        actor.system.general.diceSettings.abilityMasteryDie.value : 
        actor.system.general.diceSettings.abilityDie.value} + ${baseAttack} + ${mod}`;

    const roll = new ABFFoundryRoll(formula, actor.system);

    await roll.evaluate({async: true});

    roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor }),
        flavor: label
    });

  const attackData = ABFAttackData.builder()
  .attackAbility(roll.total)
  .damage(weapon.system.damage?.final?.value)
  .ignoreArmor(weapon.system.ignoreArmor.value)
  .reducedArmor(weapon.system.reducedArmor.final.value)
  .armorType(weapon.system.critic?.primary?.value)
  .damageType(game.abf.combat.DamageType.NONE)
  .presence(weapon.system.presence?.final?.value)
//   .aimed(true).aimedWhere("Cabeza")
  .isProjectile(false)//.projectileType("Flecha")
  .automaticCrit(false).critBonus(0)
//   .maneuvers(["Finta"])
//   .onHitEffects(["Aturdido 1 asalto"])
  .attackerId(sheet.actor.id)
  .weaponId(weapon.id)
  .build();

//   const attackData = {
//     weaponId,
//     weaponName: weapon.name,
//     attack: weapon.system.attack?.final?.value ?? 0,
//     damage: weapon.system.damage?.final?.value ?? 0,
//     block: weapon.system.block?.final?.value ?? 0,
//     presence: weapon.system.presence?.final?.value ?? 0,
//     actorId: sheet.actor.id
//   };

  // Keep original bindings in HBS: {{weapon...}} {{actor...}}
  const content = await renderTemplate(Templates.Chat.AttackData, {
    weapon,
    actor: sheet.actor,
    attackData // for {{json attackData}} in the button
  });

  await ChatMessage.create({
    content,
    speaker: ChatMessage.getSpeaker({ actor: sheet.actor })
  });
}
