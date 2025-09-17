// Builds an array of menu-item factories from all files in utils/chatContext
export function getChatContextMenuFactories() {
  // Eager import of every option module
  const contextModules = import.meta.glob("./chatContext/*.js", { eager: true });

  /** Collect factories (functions returning a ContextMenu item or array of items) */
  const factories = [];
  for (const p in contextModules) {
    const mod = contextModules[p];
    // Default export: factory function
    if (typeof mod.default === "function") factories.push(mod.default);
    // Named export 'menuItems': array of factories or plain items
    if (Array.isArray(mod.menuItems)) {
      for (const it of mod.menuItems) {
        if (typeof it === "function") factories.push(it);
        else factories.push(() => it); // wrap static item as factory
      }
    }
  }
  return factories;
}
