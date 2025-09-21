export const injectFromHookHelper = {
  name: 'injectFromHook',
  fn: function (hookName, ...args) {
    const options = args.pop(); // Handlebars siempre pasa esto al final
    const injectionParts = [];
    Hooks.call(hookName, ...args, injectionParts);
    return injectionParts.join("\n");
  }
};
