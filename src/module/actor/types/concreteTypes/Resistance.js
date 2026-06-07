import { BaseType } from '../BaseType.js';
export class Resistance extends BaseType {
  static type = 'Resistance';
  // ── Getters ───────────────────────────────────────────────────────────────
  get base()              { return this._get('base.value', 0); }
  get special()           { return this._get('special.value', 0); }
  get final()             { return this._get('final.value', 0); }
  get characteristicKey() { return this._get('characteristicKey', ''); }
  // ── Shape ─────────────────────────────────────────────────────────────────
  static defaults() {
    return {
      base:              { value: 0 },
      special:           { value: 0 },
      final:             { value: 0 },
      characteristicKey: ''
    };
  }
  // ── Migration ─────────────────────────────────────────────────────────────
  static normalizeInflateInput(node) {
    if (!node || typeof node !== 'object') return node;
    const out = { ...node };
    if (out.base !== undefined && typeof out.base !== 'object') {
      out.base = { value: Number(out.base) || 0 };
    }
    if (out.special !== undefined && typeof out.special !== 'object') {
      out.special = { value: Number(out.special) || 0 };
    }
    if (out.final !== undefined && typeof out.final !== 'object') {
      out.final = { value: Number(out.final) || 0 };
    }
    if (typeof out.characteristicKey !== 'string') {
      out.characteristicKey = '';
    }
    return out;
  }
  // ── Editor config ─────────────────────────────────────────────────────────
  static editorConfig() {
    return {
      readonly: ['base.value', 'final.value'],
      hidden:   [],
      labels: {
        'base.value':      'Base',
        'special.value':   'Special',
        'final.value':     'Final',
        characteristicKey: 'Characteristic'
      },
      order:     ['characteristicKey', 'base.value', 'special.value', 'final.value'],
      overrides: {
        characteristicKey: { kind: 'select' }
      }
    };
  }
  /**
   * Populate the characteristic selector with all registered Characteristic keys.
   * @param {Actor} actor
   */
  static getEditorFieldOptions(actor) {
    const options = [];
    const byKey = actor?.typedRepo?.get('Characteristic');
    if (byKey) {
      for (const node of byKey.values()) {
        if (!node?.key) continue;
        options.push({ value: node.key, label: node.key });
      }
    }
    options.sort((a, b) => a.label.localeCompare(b.label));
    return { characteristicKey: options };
  }
  // ── Reactive flow ─────────────────────────────────────────────────────────
  /**
   * Two specs:
   *   base  = presence.final + char.mod   (external deps via setInstanceDeps)
   *   final = base + special
   *
   * inputs keys resolved by keyFromAbsPath():
   *   characteristicKey  <- relative dep (the string key)
   *   final              <- system.general.presence.final.value  (presence)
   *   mod                <- system.characteristics.primaries.<key>.mod.value
   */
  getDerivedFlowSpecs() {
    const key = this.characteristicKey;
    const baseDeps = ['system.general.presence.final.value'];
    if (key) baseDeps.push(`system.characteristics.primaries.${key}.mod.value`);
    this.setInstanceDeps('base', baseDeps);
    return this._mergeInstanceDeps([
      {
        id:      'base',
        deps:    ['characteristicKey'],
        mods:    ['base.value'],
        compute: this.#computeBase.bind(this)
      },
      {
        id:      'final',
        deps:    ['base.value', 'special.value'],
        mods:    ['final.value'],
        compute: ({ base = 0, special = 0 }) => ({ final: base + special })
      }
    ]);
  }
  #computeBase({ final: presence = 0, mod: charMod = 0 } = {}) {
    return { base: presence + charMod };
  }
}
