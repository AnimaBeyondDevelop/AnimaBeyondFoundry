import ModifyDicePermissionsConfig from '../module/dialogs/ModifyDicePermissionsConfig';

export const ABFSettingsKeys = {
  AUTO_ACCEPT_COMBAT_REQUESTS: 'AUTO_ACCEPT_COMBAT_REQUESTS',
  ROUND_DAMAGE_IN_MULTIPLES_OF_5: 'ROUND_DAMAGE_IN_MULTIPLES_OF_5',
  SEND_ROLL_MESSAGES_ON_COMBAT_BY_DEFAULT: 'SEND_ROLL_MESSAGES_ON_COMBAT_BY_DEFAULT',
  USE_DAMAGE_TABLE: 'USE_DAMAGE_TABLE',
  DEVELOP_MODE: 'DEVELOP_MODE',
  AUTOMATE_COMBAT_DISTANCE: 'AUTOMATE_COMBAT_DISTANCE',
  MACRO_PREFIX_ATTACK: 'MACRO_PREFIX_ATTACK',
  MACRO_ATTACK_DEFAULT: 'MACRO_ATTACK_DEFAULT',
  MACRO_PROJECTILE_DEFAULT: 'MACRO_PROJECTILE_DEFAULT',
  MACRO_SHIELD_DEFAULT: 'MACRO_SHIELD_DEFAULT',
  MACRO_MISS_ATTACK_VALUE: 'MACRO_MISS_ATTACK_VALUE',
  APPLIED_MIGRATIONS: 'APPLIED_MIGRATIONS',
  WORLD_CREATION_SYSTEM_VERSION: 'WORLD_CREATION_SYSTEM_VERSION',
  MODIFY_DICE_FORMULAS_PERMISSION: 'MODIFY_DICE_FORMULAS_PERMISSION'
};

export const registerSettings = () => {
  game.settings.register('abf', ABFSettingsKeys.AUTO_ACCEPT_COMBAT_REQUESTS, {
    name: 'anima.ui.systemSettings.autoAcceptCombatRequests.title',
    hint: 'anima.ui.systemSettings.autoAcceptCombatRequests.hint.title',
    scope: 'world',
    config: true,
    default: true,
    type: Boolean
  });

  game.settings.register('abf', ABFSettingsKeys.ROUND_DAMAGE_IN_MULTIPLES_OF_5, {
    name: 'anima.ui.systemSettings.roundDamageInMultiplesOf5.title',
    hint: 'anima.ui.systemSettings.roundDamageInMultiplesOf5.hint.title',
    scope: 'world',
    config: true,
    default: false,
    type: Boolean
  });

  game.settings.register(
    'abf',
    ABFSettingsKeys.SEND_ROLL_MESSAGES_ON_COMBAT_BY_DEFAULT,
    {
      name: 'anima.ui.systemSettings.sendRollMessagesOnCombatByDefault.title',
      hint: 'anima.ui.systemSettings.sendRollMessagesOnCombatByDefault.hint.title',
      scope: 'world',
      config: true,
      default: true,
      type: Boolean
    }
  );

  game.settings.register('abf', ABFSettingsKeys.USE_DAMAGE_TABLE, {
    name: 'anima.ui.systemSettings.useCombatTable.title',
    hint: 'anima.ui.systemSettings.useCombatTable.hint.title',
    scope: 'world',
    config: true,
    default: false,
    type: Boolean
  });

  game.settings.register('abf', ABFSettingsKeys.AUTOMATE_COMBAT_DISTANCE, {
    name: 'anima.ui.systemSettings.useDistanceAutomation.title',
    hint: 'anima.ui.systemSettings.useDistanceAutomation.hint.title',
    scope: 'world',
    config: true,
    default: false,
    type: Boolean
  });

  game.settings.register('abf', ABFSettingsKeys.MACRO_PREFIX_ATTACK, {
    name: 'anima.ui.systemSettings.prefixAttackMacro.title',
    hint: 'anima.ui.systemSettings.prefixAttackMacro.hint.title',
    scope: 'world',
    config: true,
    default: '',
    type: String
  });

  game.settings.register('abf', ABFSettingsKeys.MACRO_ATTACK_DEFAULT, {
    name: 'anima.ui.systemSettings.defaultAttackMacro.title',
    hint: 'anima.ui.systemSettings.defaultAttackMacro.hint.title',
    scope: 'world',
    config: true,
    default: 'Default Attack Macro',
    type: String
  });

  game.settings.register('abf', ABFSettingsKeys.MACRO_PROJECTILE_DEFAULT, {
    name: 'anima.ui.systemSettings.defaultProjectileMacro.title',
    hint: 'anima.ui.systemSettings.defaultProjectileMacro.hint.title',
    scope: 'world',
    config: true,
    default: 'Atk Projectil Flecha',
    type: String
  });

  game.settings.register('abf', ABFSettingsKeys.MACRO_SHIELD_DEFAULT, {
    name: 'anima.ui.systemSettings.defaultShieldMacro.title',
    hint: 'anima.ui.systemSettings.defaultShieldMacro.hint.title',
    scope: 'world',
    config: true,
    default: 'Default Shield Macro',
    type: String
  });

  game.settings.register('abf', ABFSettingsKeys.MACRO_MISS_ATTACK_VALUE, {
    name: 'anima.ui.systemSettings.missValueAttackMacro.title',
    hint: 'anima.ui.systemSettings.missValueAttackMacro.hint.title',
    scope: 'world',
    config: true,
    default: 80,
    type: Number
  });

  game.settings.register('abf', ABFSettingsKeys.DEVELOP_MODE, {
    name: 'Develop mode',
    hint: 'Activate certain access to information. Only for developers',
    scope: 'world',
    config: true,
    default: false,
    type: Boolean
  });

  // This is for migration purposes, it stores the last migration version runned for the world.
  game.settings.register('abf', ABFSettingsKeys.APPLIED_MIGRATIONS, {
    name: "Applied Migration Versions",
    scope: "world",
    config: false, 
    type: Object,
    default: {}
  });

  game.settings.register("abf", ABFSettingsKeys.WORLD_CREATION_SYSTEM_VERSION, {
  name: "World Creation System Version",
  scope: "world",
  config: false,
  type: String,
  default: null
  });

  
  game.settings.register("abf", ABFSettingsKeys.MODIFY_DICE_FORMULAS_PERMISSION, {
    name: "modifyDiceFormulasPermission",
    scope: "world",
    config: false, 
    type: Object,
    default: {
      [CONST.USER_ROLES.PLAYER]: false,
      [CONST.USER_ROLES.TRUSTED]: true,
      [CONST.USER_ROLES.ASSISTANT]: true,
      [CONST.USER_ROLES.GAMEMASTER]: true
    }
  });

  game.settings.registerMenu("abf", "modifyDiceFormulasPermissionMenu", {
    name: "anima.permissions.modifyDiceFormulasPermission.title",
    label: "anima.permissions.modifyDiceFormulasPermission.title",
    hint: "anima.permissions.modifyDiceFormulasPermission.hint",
    icon: "fas fa-dice",
    type: ModifyDicePermissionsConfig,
    restricted: true
  });
};
