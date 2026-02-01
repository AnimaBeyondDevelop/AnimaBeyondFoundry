import { TypeRegistry } from './TypeRegistry.js';

export const typedTypes = (() => {
  const typeModules = {
    ...import.meta.glob('./concreteTypes/*.js', { eager: true }),
    ...import.meta.glob('./**/concreteTypes/*.js', { eager: true })
  };

  const registerCtor = (ctor, src) => {
    if (typeof ctor !== 'function') return;

    const type = ctor.type;
    if (typeof type !== 'string' || !type.length) return;

    TypeRegistry.register(ctor);
  };

  for (const p in typeModules) {
    const mod = typeModules[p];

    // 1) default export class
    if (typeof mod.default === 'function') registerCtor(mod.default, `default@${p}`);

    // 2) named export: types = [Ctor, ...]
    if (Array.isArray(mod.types)) mod.types.forEach(t => registerCtor(t, `types@${p}`));

    // 3) any exported function/class with static .type
    for (const [key, value] of Object.entries(mod)) {
      if (typeof value === 'function' && typeof value.type === 'string') {
        registerCtor(value, `${key}@${p}`);
      }
    }
  }

  console.debug(`[ABF] TypeRegistry loaded (${TypeRegistry.size ?? '?'})`);

  return TypeRegistry;
})();
