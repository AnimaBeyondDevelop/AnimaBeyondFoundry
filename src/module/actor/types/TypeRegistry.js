export class TypeRegistry {
  static #byType = new Map(); // type -> ctor

  static get size() {
    return this.#byType.size;
  }

  static register(ctor) {
    this.#byType.set(ctor.type, ctor);
  }

  static get(type) {
    return this.#byType.get(type) ?? null;
  }

  static create(type, actor, systemPath) {
    const ctor = this.get(type);
    if (!ctor) throw new Error(`Unknown type: ${type}`);
    return new ctor(actor, systemPath);
  }

  static defaultsFor(type) {
    const ctor = this.get(type);
    if (!ctor) throw new Error(`Unknown type: ${type}`);
    return ctor.defaults();
  }
}
