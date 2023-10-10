export const executeArgsMacro = (name, args) => {
  //Se espera 1 segundo para sincronizar la animacion
  setTimeout(() => {
    const macro = game.macros.getName(name);
    if (macro) {
      macro.execute(args);
    } else {
      console.debug(`Macro '${name}' not found.`);
    }
  }, 250);
};
