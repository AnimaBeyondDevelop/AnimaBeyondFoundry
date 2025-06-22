import { renderTemplates } from '../module/utils/renderTemplates';
import { Templates } from '../module/utils/constants';
import { ABFMacros } from '../module/macros/ABFMacros';
import { ABFSettingsKeys } from './registerSettings';
import { Logger } from './log';
import { PromptDialog } from '../module/dialogs/PromptDialog';

/**
 * @typedef {Object} DefaultMacroConfig
 * @property {string} [macroSelectorId]
 * @property {string} titleKey
 * @property {string} icon
 * @property {string} shortcut
 * @property {(e: KeyboardEvent) => boolean} hotkey
 * @property {() => void} fn
 */

const DEFAULT_USER_MACROS = [
  {
    macroSelectorId: '#custom-hotbar-damage-calculator',
    titleKey: 'customHotbar.damageCalculator',
    icon: 'systems/animabf/assets/icons/game-icons.net/ffffff/delapouite/calculator.svg',
    shortcut: 'ctrl + 1',
    hotkey: e => e.ctrlKey && e.key === '1',
    fn: () => ABFMacros.damageCalculator()
  },
  {
    macroSelectorId: '#custom-hotbar-send-attack',
    titleKey: 'customHotbar.sendAttack',
    icon: 'systems/animabf/assets/icons/game-icons.net/ffffff/lorc/sword-clash.svg',
    shortcut: 'ctrl + 2',
    hotkey: e => e.ctrlKey && e.key === '2',
    fn: () => window.Websocket.sendAttack?.()
  }
];

export const attachCustomMacroBar = async () => {
  const isGM = game.user?.isGM;

  /** @type {DefaultMacroConfig[]} */
  let defaultMacroConfigs = [...DEFAULT_USER_MACROS];


  Hooks.callAll('getCustomMacroButtons', defaultMacroConfigs, { isGM });

  const macros = defaultMacroConfigs.map(m => ({
    ...m,
    id: m.macroSelectorId?.replace('#', '') ?? '',
    title: game.i18n.localize(m.titleKey)
  }));

  const [customHotbarHTML] = await renderTemplates({
    name: Templates.CustomHotBar,
    context: { macros, isGM }
  });

  $('.system-animabf').append(customHotbarHTML);

  for (const config of defaultMacroConfigs) {
    if (config.macroSelectorId) {
      $(config.macroSelectorId).on('click', () => config.fn());
    }
  }

  document.addEventListener('keyup', () => {
    for (const config of defaultMacroConfigs) {
      if (config.macroSelectorId) {
        $(config.macroSelectorId).removeClass('hover');
      }
    }
  });

  document.addEventListener('keydown', e => {
    for (const config of defaultMacroConfigs) {
      if (e.ctrlKey && config.macroSelectorId) {
        $(config.macroSelectorId).addClass('hover');
      }
      if (config.hotkey(e)) {
        e.preventDefault();
        config.fn();
      }
    }
  });
};
