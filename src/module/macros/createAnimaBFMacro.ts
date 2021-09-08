export const createAnimaBFMacro = async (data, slot): Promise<void> => {
  if (data.type !== 'Item') return;

  if (!('data' in data)) {
    ui.notifications?.warn('You can only create macro buttons for owned Items');

    return;
  }

  const item = data.data;
  const typedGame = game as Game;

  // Create the macro command
  const command = `alert("${item.name}");`;

  let macro: Macro | undefined = typedGame.macros?.entities.find(
    m => m.name === item.name && m.data.command === command
  ) as Macro;

  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: 'script',
      img: item.img,
      command,
      flags: { 'dnd5e.itemMacro': true }
    });
  }

  if (macro) {
    typedGame.user?.assignHotbarMacro(macro, slot);
  }
};
