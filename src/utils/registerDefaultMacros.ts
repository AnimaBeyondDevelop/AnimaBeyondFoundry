import { damageCalculatorMacro } from '../module/macros/damageCalculator/damageCalculatorMacro';

export type MacroConstructorData = {
  name: string;
  type: string;
  img: string;
  command: string;
  flags: { id: string };
};

type MacroConstructorWithSlot = { slot: number; macro: MacroConstructorData };

const GM_DEFAULT_MACROS: MacroConstructorWithSlot[] = [{ slot: 1, macro: damageCalculatorMacro }];
const PLAYER_DEFAULT_MACROS: MacroConstructorWithSlot[] = [];

const createMacroIfNotExist = async ({ slot, macro }: MacroConstructorWithSlot) => {
  const typedGame = game as Game;

  const currentUser = typedGame.user;

  if (currentUser?.getHotbarMacros(1)[slot - 1].macro) return;

  const oldMacro: Macro | undefined = typedGame.macros?.entities.find(m => m.data.flags.id === macro.flags.id) as Macro;

  if (!oldMacro) {
    const newMacro = await Macro.create(macro as any);

    if (newMacro) {
      currentUser?.assignHotbarMacro(newMacro, slot);
    }
  }
};

export const registerDefaultMacros = async () => {
  const typedGame = game as Game;

  const currentUser = typedGame.user;

  if (currentUser?.isGM) {
    GM_DEFAULT_MACROS.forEach(m => createMacroIfNotExist(m));
  } else {
    PLAYER_DEFAULT_MACROS.forEach(m => createMacroIfNotExist(m));
  }
};
