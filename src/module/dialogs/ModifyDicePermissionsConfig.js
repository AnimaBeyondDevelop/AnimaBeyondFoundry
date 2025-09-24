import { ABFSettingsKeys } from '../../utils/registerSettings';
import { Templates } from '../utils/constants';

export default class ModifyDicePermissionsConfig extends FormApplication {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: 'modify-dice-formulas-permission',
      title: 'anima.permissions.modifyDiceFormulasPermission.title',
      template: Templates.Dialog.Config.ModifyDiceFormulas,
      width: 400
    });
  }

  getData() {
    const roleLabel = key => {
      // key: "PLAYER", "TRUSTED", "ASSISTANT", "GAMEMASTER"
      const cap = key.charAt(0) + key.slice(1).toLowerCase(); // "Player", "Trusted", ...
      const i18nKey = `USER.Role${cap}`; // e.g. "USER.RolePlayer"
      const localized = game.i18n.localize(i18nKey);
      // If no translation is found, fall back to a pretty name
      return localized !== i18nKey ? localized : cap.replace(/Gm/i, 'GM');
    };

    return {
      roles: Object.entries(CONST.USER_ROLES)
        .filter(([key, val]) => typeof val === 'number')
        .map(([key, val]) => ({
          key,
          val,
          label: roleLabel(key),
          checked: this.settings[val]
        }))
    };
  }

  get settings() {
    return (
      game.settings.get(
        game.animabf.id,
        ABFSettingsKeys.MODIFY_DICE_FORMULAS_PERMISSION
      ) || {}
    );
  }

  async _updateObject(event, formData) {
    const newSettings = {};
    for (let [k, v] of Object.entries(formData)) {
      newSettings[k] = v === 'true' || v === true;
    }
    await game.settings.set(
      game.animabf.id,
      ABFSettingsKeys.MODIFY_DICE_FORMULAS_PERMISSION,
      newSettings
    );
  }
}
