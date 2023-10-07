export const executeArgsMacro = (name, args) => {
    const macro = game.macros.getName(name);
    if (macro) {
        macro.execute(args)
      } else {
        console.error(`Macro '${name}' not found.`);
    }
}