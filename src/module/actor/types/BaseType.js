export class BaseType {
  static type = 'BaseType';

  constructor(actor, systemPath) {
    if (new.target === BaseType) {
      throw new Error('BaseType is abstract and cannot be instantiated directly.');
    }

    this.actor = actor;
    this.systemPath = systemPath;
  }

  // ---- Instance extra deps (per derived spec id) ----
  _instanceExtraDeps = new Map();

  /** @param {string} specId @param {string[]} deps */
  setInstanceDeps(specId, deps) {
    const arr = Array.isArray(deps) ? deps.filter(Boolean) : [];
    this._instanceExtraDeps.set(specId, arr);
  }

  /** @param {string} specId */
  clearInstanceDeps(specId) {
    this._instanceExtraDeps.delete(specId);
  }

  /** @param {string} specId @returns {string[]} */
  getInstanceDeps(specId) {
    return this._instanceExtraDeps.get(specId) ?? [];
  }

  /**
   * Merge instance deps into the provided specs.
   * Call this at the end of getDerivedFlowSpecs() in subclasses.
   *
   * @param {Array<{id:string,deps:string[],mods:string[],compute:Function}>} specs
   */
  _mergeInstanceDeps(specs) {
    return (specs ?? []).map(s => {
      const extra = this.getInstanceDeps(s.id);
      if (!extra.length) return s;
      return { ...s, deps: [...(s.deps ?? []), ...extra] };
    });
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

  /** Common fields shared by all typed nodes */
  static commonDefaults() {
    return { key: '' };
  }

  /** Type-specific defaults used for migrations */
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

    const base = foundry.utils.mergeObject(BaseType.commonDefaults(), this.defaults(), {
      inplace: false,
      insertKeys: true,
      insertValues: true
    });

    const merged = foundry.utils.mergeObject(base, normalized, {
      inplace: false,
      insertKeys: true,
      insertValues: true
    });

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

    const allowed = new Set([
      ...Object.keys(BaseType.commonDefaults()),
      ...Object.keys(this.defaults())
    ]);

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
    const base = foundry.utils.mergeObject(BaseType.commonDefaults(), this.defaults(), {
      inplace: false,
      insertKeys: true,
      insertValues: true
    });

    const merged = foundry.utils.mergeObject(base, data ?? {}, {
      inplace: false,
      insertKeys: true,
      insertValues: true
    });

    return this.pruneToDefaults(merged);
  }

  getByKey(type, key) {
    return this.actor.typedRepo?.get(type)?.get(key) ?? null;
  }

  getValueByKey(type, key, relPath) {
    const node = this.getByKey(type, key);
    if (!node) return undefined;
    return foundry.utils.getProperty(this.actor, `${node.systemPath}.${relPath}`);
  }

  get key() {
    // If key is not stored, default to the last segment of the system path
    const stored = this._get('key', '');
    if (stored) return stored;

    const parts = String(this.systemPath ?? '').split('.');
    return parts.length ? parts[parts.length - 1] : '';
  }

  set key(v) {
    this._set('key', String(v ?? ''));
  }

  /**
   * Persist the default key if it's missing or empty.
   * This writes into the actor's system data (in-memory). Persisting to the document
   * should be done by the caller (e.g. ABFActor.updateSource in prepareDerivedData).
   *
   * @returns {string} The key after ensuring.
   */
  ensureDefaultKey() {
    const current = this._get('key', undefined);
    if (current == null || current === '') {
      const derived = BaseType.deriveKeyFromSystemPath(this.systemPath);
      if (derived) this._set('key', derived);
      return derived;
    }
    return String(current);
  }

  /**
   * Static helper to persist a default key on raw system data, without needing an instance.
   * Useful if you prefer to patch this.system directly in ABFActor.
   *
   * @param {object} systemRoot Usually actor.system
   * @param {string} systemPath Path to the node (e.g. "system.characteristics.primaries.agility")
   * @returns {boolean} True if it changed something
   */
  static ensureDefaultKeyOnNodeData(systemRoot, systemPath) {
    if (!systemRoot || typeof systemRoot !== 'object') return false;
    if (!systemPath || typeof systemPath !== 'string') return false;

    const keyPath = `${systemPath}.key`;
    const current = foundry.utils.getProperty(systemRoot, keyPath);

    if (current == null || current === '') {
      const derived = BaseType.deriveKeyFromSystemPath(systemPath);
      if (!derived) return false;
      foundry.utils.setProperty(systemRoot, keyPath, derived);
      return true;
    }

    return false;
  }

  static deriveKeyFromSystemPath(systemPath) {
    const parts = String(systemPath ?? '').split('.');
    return parts.length ? parts[parts.length - 1] : '';
  }

  static editorConfig() {
    return {
      readonly: ['key'],
      hidden: [],
      labels: { key: 'Key' },
      order: [],
      overrides: {
        // Example:
        // key: { readonly: false },
        // 'someField.value': { hidden: true }
      }
    };
  }
}
