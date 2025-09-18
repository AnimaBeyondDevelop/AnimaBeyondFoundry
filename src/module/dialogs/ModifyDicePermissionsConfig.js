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
    return {
      roles: Object.entries(CONST.USER_ROLES)
        .filter(([key, val]) => typeof val === 'number')
        .map(([key, val]) => ({
          key,
          val,
          label: game.i18n.localize(`USER.Role${key.capitalize()}`),
          checked: this.settings[val]
        }))
    };
  }

  get settings() {
    return (
      game.settings.get(game.abf.id, ABFSettingsKeys.MODIFY_DICE_FORMULAS_PERMISSION) ||
      {}
    );
  }

  async _updateObject(event, formData) {
    const newSettings = {};
    for (let [k, v] of Object.entries(formData)) {
      newSettings[k] = v === 'true' || v === true;
    }
    await game.settings.set(
      game.abf.id,
      ABFSettingsKeys.MODIFY_DICE_FORMULAS_PERMISSION,
      newSettings
    );
  }
}
