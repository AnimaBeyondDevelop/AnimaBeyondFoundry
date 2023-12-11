/**
 * Executes a macro with a given name and arguments after a delay of 0.250 seconds.
 * It is delay so the animation does not start at the same time that the combat dialog closes.
 * 
 * @param {string} [name] - The name of the macro to execute.
 * @param {object} [args] - The arguments to pass to the macro.
 * @returns {void}
 */
export const executeMacro = (name, args) => {
  if (!name) { return }
  setTimeout(() => {
    const macro = game.macros.getName(name);
    if (macro) {
      macro.execute(args);
    } else {
      console.debug(`Macro '${name}' not found.`);
    }
  }, 250);
};
