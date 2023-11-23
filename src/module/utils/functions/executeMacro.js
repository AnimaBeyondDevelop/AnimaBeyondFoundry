export const executeMacro = (name, args) => {
  //Se espera 0.250 segundos para que la animacion no empiece
  //en el mismo momento que se cierra el dialogo de combate
  setTimeout(() => {
    const macro = game.macros.getName(name);
    if (macro) {
      macro.execute(args);
    } else {
      console.debug(`Macro '${name}' not found.`);
    }
  }, 250);
};
