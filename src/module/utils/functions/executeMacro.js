import { Logger } from '../../../utils';
import { ABFSettingsKeys } from '../../../utils/registerSettings';
/**
 * Executes a macro with a given name and arguments after a delay of 0.250 seconds.
 * It is delayed so the animation does not start at the same time that the combat dialog closes.
 *
 * @param {string} [name] - The name of the macro to execute.
 * @param {object} [args] - The arguments to pass to the macro.
 * @returns {void}
 */
export const executeMacro = (name, args) => {
  if (!name) {
    return;
  }
  setTimeout(() => {
    const macro = game.macros.getName(name);
    Logger.debug(args);
    if (macro) {
      macro.execute(args);
    } else {
      Logger.debug(`Macro '${name}' not found.`);
      let defaultMacroName = '';
      if (args.shieldId) {
        defaultMacroName = game.settings.get(
          game.animabf.id,
          ABFSettingsKeys.MACRO_SHIELD_DEFAULT
        );
      } else if (args.projectile?.name) {
        defaultMacroName = game.settings.get(
          game.animabf.id,
          ABFSettingsKeys.MACRO_PROJECTILE_DEFAULT
        );
      } else {
        defaultMacroName = game.settings.get(
          game.animabf.id,
          ABFSettingsKeys.MACRO_ATTACK_DEFAULT
        );
      }
      game.macros.getName(defaultMacroName)?.execute(args);
    }
  }, 250);
};
