// utils/preloadTemplates.js
import { Templates } from '../module/utils/constants.js';
import { System } from './systemMeta.js';

/**
 * Precarga todas las plantillas y registra alias de parciales (ui/*)
 * para poder usarlos como {{> "ui/group-header"}} en los HBS.
 */
export async function preloadTemplates() {
  const BASE = `systems/${System.id}/templates`;

  // === Lista completa (igual que la que tenías, pero dinámica) ===
  const templatePaths = [
    // --- Dialogs (desde Templates) ---
    Templates.Dialog.ModDialog,
    Templates.Dialog.DamageCalculator,
    Templates.Dialog.SpellShieldConfigDialog,
    Templates.Dialog.SpellAttackConfigDialog,
    Templates.Dialog.newSupernaturalShield.main,
    Templates.Dialog.newSupernaturalShield.parts.mystic,
    Templates.Dialog.newSupernaturalShield.parts.psychic,
    Templates.Dialog.Combat.CombatAttackDialog.main,
    Templates.Dialog.Combat.CombatAttackDialog.parts.combat,
    Templates.Dialog.Combat.CombatAttackDialog.parts.mystic,
    Templates.Dialog.Combat.CombatAttackDialog.parts.psychic,
    Templates.Dialog.Combat.CombatDefenseDialog.main,
    Templates.Dialog.Combat.CombatDefenseDialog.parts.combat,
    Templates.Dialog.Combat.CombatDefenseDialog.parts.damageResistance,
    Templates.Dialog.Combat.CombatDefenseDialog.parts.mystic,
    Templates.Dialog.Combat.CombatDefenseDialog.parts.psychic,
    Templates.Dialog.Combat.CombatRequestDialog,
    Templates.Dialog.Combat.GMCombatDialog,
    Templates.Dialog.Combat.DefenseConfigDialog,
    Templates.Dialog.Combat.AttackConfigDialog,
    Templates.Dialog.Icons.Accept,
    Templates.Dialog.Icons.Cancel,

    // --- Custom Hotbar ---
    Templates.CustomHotBar,

    // --- Chat cards ---
    Templates.Chat.AutoCombatResult,
    Templates.Chat.CombatResult,
    Templates.Chat.AttackData,
    Templates.Chat.MultiDefenseResult,
    Templates.Chat.AttackTargetsChips,

    // --- Common UI partials ---
    `${BASE}/common/ui/horizontal-titled-input.hbs`,
    `${BASE}/common/ui/vertical-titled-input.hbs`,
    `${BASE}/common/ui/group.hbs`,
    `${BASE}/common/ui/group-header.hbs`,
    `${BASE}/common/ui/group-header-title.hbs`,
    `${BASE}/common/ui/group-body.hbs`,
    `${BASE}/common/ui/group-footer.hbs`,
    `${BASE}/common/ui/add-item-button.hbs`,
    `${BASE}/common/ui/custom-select.hbs`,
    `${BASE}/common/ui/custom-select-choices.hbs`,
    `${BASE}/common/ui/loading-indicator.hbs`,

    // --- Domain partials ---
    `${BASE}/common/domain/weapon/one-or-two-handed.hbs`,
    `${BASE}/common/domain/weapon/knowledge-type.hbs`,
    `${BASE}/common/domain/weapon/select-ammo.hbs`,
    `${BASE}/common/domain/armor/select-armor-type.hbs`,
    `${BASE}/common/domain/armor/select-armor-localization.hbs`,
    `${BASE}/common/domain/select-quality.hbs`,

    // --- Items sheets ---
    `${BASE}/items/base/base-sheet.hbs`,
    `${BASE}/items/base/parts/item-image.hbs`,
    `${BASE}/items/weapon/weapon.hbs`,
    `${BASE}/items/ammo/ammo.hbs`,
    `${BASE}/items/armor/armor.hbs`,
    `${BASE}/items/spell/spell.hbs`,
    `${BASE}/items/psychicPower/psychicPower.hbs`,

    // --- Actor sheet: header ---
    `${BASE}/actor/parts/header/header.hbs`,
    `${BASE}/actor/parts/header/parts/top.hbs`,
    `${BASE}/actor/parts/header/parts/actor-image.hbs`,
    `${BASE}/actor/parts/header/parts/total-armor.hbs`,
    `${BASE}/actor/parts/header/parts/common-resources.hbs`,
    `${BASE}/actor/parts/header/parts/modifiers.hbs`,
    `${BASE}/actor/parts/header/parts/primary-characteristics.hbs`,
    `${BASE}/actor/parts/header/parts/resistances.hbs`,

    // --- Actor sheet: general ---
    `${BASE}/actor/parts/general/general.hbs`,
    `${BASE}/actor/parts/general/parts/level.hbs`,
    `${BASE}/actor/parts/general/parts/language.hbs`,
    `${BASE}/actor/parts/general/parts/elan.hbs`,
    `${BASE}/actor/parts/general/parts/titles.hbs`,
    `${BASE}/actor/parts/general/parts/destiny-points.hbs`,
    `${BASE}/actor/parts/general/parts/presence.hbs`,
    `${BASE}/actor/parts/general/parts/experience.hbs`,
    `${BASE}/actor/parts/general/parts/advantages.hbs`,
    `${BASE}/actor/parts/general/parts/disadvantages.hbs`,
    `${BASE}/actor/parts/general/parts/aspect.hbs`,
    `${BASE}/actor/parts/general/parts/description.hbs`,
    `${BASE}/actor/parts/general/parts/regeneration.hbs`,
    `${BASE}/actor/parts/general/parts/contacts.hbs`,
    `${BASE}/actor/parts/general/parts/notes.hbs`,
    `${BASE}/actor/parts/general/parts/inventory-items.hbs`,
    `${BASE}/actor/parts/general/parts/money.hbs`,

    // --- Actor sheet: secondaries ---
    `${BASE}/actor/parts/secondaries/secondaries.hbs`,
    `${BASE}/actor/parts/secondaries/common/secondary-skill.hbs`,
    `${BASE}/actor/parts/secondaries/parts/athletics.hbs`,
    `${BASE}/actor/parts/secondaries/parts/vigor.hbs`,
    `${BASE}/actor/parts/secondaries/parts/perception.hbs`,
    `${BASE}/actor/parts/secondaries/parts/intellectual.hbs`,
    `${BASE}/actor/parts/secondaries/parts/subterfuge.hbs`,
    `${BASE}/actor/parts/secondaries/parts/social.hbs`,
    `${BASE}/actor/parts/secondaries/parts/creative.hbs`,
    `${BASE}/actor/parts/secondaries/parts/secondary-special-skills.hbs`,

    // --- Actor sheet: combat ---
    `${BASE}/actor/parts/combat/combat.hbs`,
    `${BASE}/actor/parts/combat/parts/base-values.hbs`,
    `${BASE}/actor/parts/combat/parts/combat-special-skills.hbs`,
    `${BASE}/actor/parts/combat/parts/combat-tables.hbs`,
    `${BASE}/actor/parts/combat/parts/ammo.hbs`,
    `${BASE}/actor/parts/combat/parts/armors.hbs`,
    `${BASE}/actor/parts/combat/parts/weapons.hbs`,
    `${BASE}/actor/parts/combat/parts/supernatural-shields.hbs`,

    // --- Actor sheet: mystic ---
    `${BASE}/actor/parts/mystic/mystic.hbs`,
    `${BASE}/actor/parts/mystic/parts/act.hbs`,
    `${BASE}/actor/parts/mystic/parts/magic-projection.hbs`,
    `${BASE}/actor/parts/mystic/parts/zeon-regeneration.hbs`,
    `${BASE}/actor/parts/mystic/parts/innate-magic.hbs`,
    `${BASE}/actor/parts/mystic/parts/zeon.hbs`,
    `${BASE}/actor/parts/mystic/parts/mystic-settings.hbs`,
    `${BASE}/actor/parts/mystic/parts/summoning.hbs`,
    `${BASE}/actor/parts/mystic/parts/spheres.hbs`,
    `${BASE}/actor/parts/mystic/parts/spells/spells.hbs`,
    `${BASE}/actor/parts/mystic/parts/spells/grade/grade.hbs`,
    `${BASE}/actor/parts/mystic/parts/spell-maintenances.hbs`,
    `${BASE}/actor/parts/mystic/parts/selected-spells.hbs`,
    `${BASE}/actor/parts/mystic/parts/prepared-spells.hbs`,
    `${BASE}/actor/parts/mystic/parts/summons.hbs`,
    `${BASE}/actor/parts/mystic/parts/metamagics.hbs`,

    // --- Actor sheet: domine ---
    `${BASE}/actor/parts/domine/domine.hbs`,
    `${BASE}/actor/parts/domine/parts/ki-skills.hbs`,
    `${BASE}/actor/parts/domine/parts/nemesis-skills.hbs`,
    `${BASE}/actor/parts/domine/parts/ars-magnus.hbs`,
    `${BASE}/actor/parts/domine/parts/martial-arts.hbs`,
    `${BASE}/actor/parts/domine/parts/creatures.hbs`,
    `${BASE}/actor/parts/domine/parts/special-skills-tables.hbs`,
    `${BASE}/actor/parts/domine/parts/ki-accumulation.hbs`,
    `${BASE}/actor/parts/domine/parts/martial-knowledge.hbs`,
    `${BASE}/actor/parts/domine/parts/seals.hbs`,
    `${BASE}/actor/parts/domine/parts/techniques.hbs`,

    // --- Actor sheet: psychic ---
    `${BASE}/actor/parts/psychic/psychic.hbs`,
    `${BASE}/actor/parts/psychic/parts/psychic-potential.hbs`,
    `${BASE}/actor/parts/psychic/parts/psychic-projection.hbs`,
    `${BASE}/actor/parts/psychic/parts/mental-patterns.hbs`,
    `${BASE}/actor/parts/psychic/parts/innate-psychic-powers.hbs`,
    `${BASE}/actor/parts/psychic/parts/psychic-points.hbs`,
    `${BASE}/actor/parts/psychic/parts/psychic-settings.hbs`,
    `${BASE}/actor/parts/psychic/parts/psychic-disciplines.hbs`,
    `${BASE}/actor/parts/psychic/parts/psychic-powers.hbs`,

    // --- Actor sheet: effects ---
    `${BASE}/actor/parts/effects/effects.hbs`,
    `${BASE}/actor/parts/effects/parts/effects-list.hbs`,

    // --- Actor sheet: settings ---
    `${BASE}/actor/parts/settings/settings.hbs`,
    `${BASE}/actor/parts/settings/parts/tabVisibility.hbs`,
    `${BASE}/actor/parts/settings/parts/automationOptions.hbs`,
    `${BASE}/actor/parts/settings/parts/advancedSettings.hbs`,
    `${BASE}/actor/parts/settings/parts/advancedCharacteristics.hbs`
  ];

  // Precarga en caché
  await loadTemplates(templatePaths);

  // === Registrar alias de parciales "ui/*" para usarlos en HBS ===
  const PARTIAL_ALIASES = {
    'ui/group': `${BASE}/common/ui/group.hbs`,
    'ui/group-header': `${BASE}/common/ui/group-header.hbs`,
    'ui/group-body': `${BASE}/common/ui/group-body.hbs`,
    'ui/group-footer': `${BASE}/common/ui/group-footer.hbs`,
    'ui/horizontal-titled-input': `${BASE}/common/ui/horizontal-titled-input.hbs`,
    'ui/vertical-titled-input': `${BASE}/common/ui/vertical-titled-input.hbs`,
    'ui/custom-select': `${BASE}/common/ui/custom-select.hbs`,
    'ui/loading-indicator': `${BASE}/common/ui/loading-indicator.hbs`,

    // (opcional) alias extra si los quieres usar como {{> "ui/..."}}
    'ui/group-header-title': `${BASE}/common/ui/group-header-title.hbs`,
    'ui/add-item-button': `${BASE}/common/ui/add-item-button.hbs`,
    'ui/custom-select-choices': `${BASE}/common/ui/custom-select-choices.hbs`
  };

  for (const [alias, path] of Object.entries(PARTIAL_ALIASES)) {
    const compiled = await getTemplate(path);
    Handlebars.registerPartial(alias, compiled);
  }

  console.debug('[ABF] preloadTemplates OK. Total:', templatePaths.length);
  return templatePaths;
}
