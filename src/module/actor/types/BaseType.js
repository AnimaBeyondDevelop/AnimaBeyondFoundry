export class BaseType {
  static type = 'BaseType';

  constructor(actor, systemPath) {
    if (new.target === BaseType) {
      throw new Error('BaseType is abstract and cannot be instantiated directly.');
    }

    this.actor = actor;
    this.systemPath = systemPath;
  }

  _get(relPath, fallback = undefined) {
    return (
      foundry.utils.getProperty(this.actor, `${this.systemPath}.${relPath}`) ?? fallback
    );
  }

  _set(relPath, value) {
    foundry.utils.setProperty(this.actor, `${this.systemPath}.${relPath}`, value);
  }

  /**
   * Returns derived calculation specs for effectFlow.
   * Subclasses should override and may return multiple specs (e.g. "final", "mod").
   *
   * - deps/mods are RELATIVE to this.systemPath (e.g. "base.value")
   * - compute must be a pure function (no side-effects) that returns an object
   *   with keys matching the logical fields written by mods (e.g. { final: 10 }).
   *
   * @returns {Array<{
   *   id: string,
   *   deps: string[],
   *   mods: string[],
   *   compute: (inputs: Record<string, any>) => Record<string, any>
   * }>}
   */
  getDerivedFlowSpecs() {
    return [];
  }

  // Optionally keep applyDerived temporarily (legacy)
  applyDerived() {
    throw new Error(`${this.constructor.name}.applyDerived() not implemented.`);
  }

  /** Structure defaults used for migrations */
  static defaults() {
    return {};
  }

  static normalizeInflateInput(node) {
    // Default: no-op
    return node;
  }

  static inflate(overrides, nodeWithoutMarker) {
    const combined = foundry.utils.mergeObject(overrides ?? {}, nodeWithoutMarker ?? {}, {
      inplace: false,
      insertKeys: true,
      insertValues: true
    });

    const normalized = this.normalizeInflateInput(combined);

    const merged = foundry.utils.mergeObject(this.defaults(), normalized, {
      inplace: false,
      insertKeys: true,
      insertValues: true
    });

    // IMPORTANT: remove legacy keys like "value" or "__type"
    return this.pruneToDefaults(merged);
  }

  /**
   * Remove keys that are not part of this type's default shape.
   * Mutates and returns the same object.
   * @param {object} obj
   * @returns {object}
   */
  static pruneToDefaults(obj) {
    if (!obj || typeof obj !== 'object') return obj;

    const allowed = new Set(Object.keys(this.defaults()));
    for (const k of Object.keys(obj)) {
      if (!allowed.has(k)) delete obj[k];
    }
    return obj;
  }

  /**
   * Convenience: merge defaults + data, then prune to defaults shape.
   * Returns a new object.
   * @param {object} data
   * @returns {object}
   */
  static sanitize(data) {
    const merged = foundry.utils.mergeObject(this.defaults(), data ?? {}, {
      inplace: false,
      insertKeys: true,
      insertValues: true
    });
    return this.pruneToDefaults(merged);
  }
}
