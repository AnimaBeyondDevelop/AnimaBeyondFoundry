import { renderTemplates } from '../module/utils/renderTemplates';
import { Templates } from '../module/utils/constants';
import { ABFMacros } from '../module/macros/ABFMacros';
import { ABFSettingsKeys } from './registerSettings';
import { Log } from './Log';
import { PromptDialog } from '../module/dialogs/PromptDialog';

type DefaultMacroConfig = {
  macroSelectorId?: `#${string}`;
  hotkey: (e: KeyboardEvent) => boolean;
  fn: () => void;
};

const DEFAULT_GM_MACROS: DefaultMacroConfig[] = [
  {
    macroSelectorId: '#custom-hotbar-damage-calculator',
    hotkey: e => e.ctrlKey && e.key === '1',
    fn: () => ABFMacros.damageCalculator()
  },
  {
    macroSelectorId: '#custom-hotbar-send-attack',
    hotkey: e => e.ctrlKey && e.key === '2',
    fn: () => window.Websocket.sendAttack?.()
  }
];

const DEFAULT_USER_MACROS: DefaultMacroConfig[] = [
  {
    macroSelectorId: '#custom-hotbar-send-attack-request',
    hotkey: e => e.ctrlKey && e.key === '1',
    fn: () => window.Websocket.sendAttackRequest?.()
  }
];

export const attachCustomMacroBar = async () => {
  const tgame = game as Game;

  const isGM = tgame.user?.isGM;

  const [customHotbarHTML] = await renderTemplates({
    name: Templates.CustomHotBar,
    context: {
      isGM
    }
  });

  $('.system-animabf').append(customHotbarHTML);

  const defaultMacroConfigs = isGM ? DEFAULT_GM_MACROS : DEFAULT_USER_MACROS;

  if (tgame.settings.get('animabf', ABFSettingsKeys.DEVELOP_MODE) && isGM) {
    defaultMacroConfigs.push({
      hotkey: e => e.ctrlKey && e.key === 'd',
      fn() {
        Log.log('Debug');
        return new PromptDialog('This is a test, are you ready to explode?');
      }
    });
  }

  for (const config of defaultMacroConfigs) {
    if (config.macroSelectorId) {
      $(config.macroSelectorId).click(() => {
        config.fn();
      });
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
