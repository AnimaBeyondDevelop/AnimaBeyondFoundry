// module/actor/types/GenericBaseTypeEditor.js
import { BaseType } from './BaseType.js';
import { TypeRegistry } from './TypeRegistry.js';
import { collectEditablePaths } from './collectEditablePaths.js';
import { Templates } from '../../utils/constants.js';

function normalizeEditorConfig(cfg) {
  return {
    readonly: Array.isArray(cfg?.readonly) ? cfg.readonly : [],
    hidden: Array.isArray(cfg?.hidden) ? cfg.hidden : [],
    labels: cfg?.labels && typeof cfg.labels === 'object' ? cfg.labels : {},
    order: Array.isArray(cfg?.order) ? cfg.order : [],
    // Per-field overrides: { "key": { readonly: false, hidden: true, label: "...", kind:"select", options:[...] }, ... }
    overrides: cfg?.overrides && typeof cfg.overrides === 'object' ? cfg.overrides : {}
  };
}

function mergeEditorConfig(baseCfg, typeCfg) {
  const base = normalizeEditorConfig(baseCfg);
  const type = normalizeEditorConfig(typeCfg);

  const readonly = new Set([...base.readonly, ...type.readonly]);
  const hidden = new Set([...base.hidden, ...type.hidden]);

  const labels = { ...base.labels, ...type.labels };
  const order = type.order.length ? type.order : base.order;

  const overrides = { ...base.overrides, ...type.overrides };

  for (const [fieldPath, o] of Object.entries(overrides)) {
    if (!o || typeof o !== 'object') continue;

    if (o.label !== undefined) labels[fieldPath] = String(o.label);

    if (o.hidden === true) hidden.add(fieldPath);
    if (o.hidden === false) hidden.delete(fieldPath);

    if (o.readonly === true) readonly.add(fieldPath);
    if (o.readonly === false) readonly.delete(fieldPath);
  }

  return { readonly, hidden, labels, order, overrides };
}

export class GenericBaseTypeEditor extends FormApplication {
  constructor(actor, { type, path }) {
    super({}, {});
    this.actor = actor;
    this.type = type;
    this.path = path;

    const ctor = TypeRegistry.get(type);

    this._defaults = foundry.utils.mergeObject(
      BaseType.commonDefaults(),
      ctor?.defaults?.() ?? {},
      { inplace: false, insertKeys: true, insertValues: true }
    );

    this._mergedCfg = mergeEditorConfig(
      BaseType.editorConfig?.(),
      ctor?.editorConfig?.()
    );

    let fieldPaths = collectEditablePaths(this._defaults).filter(
      p => !this._mergedCfg.hidden.has(p)
    );

    if (this._mergedCfg.order.length) {
      const ordered = this._mergedCfg.order.filter(p => fieldPaths.includes(p));
      const rest = fieldPaths.filter(p => !this._mergedCfg.order.includes(p));
      fieldPaths = [...ordered, ...rest];
    }

    this._fields = fieldPaths.map(fp => {
      const def = foundry.utils.getProperty(this._defaults, fp);
      const o = this._mergedCfg.overrides?.[fp];

      let kind = 'string';
      if (typeof def === 'number') kind = 'number';
      else if (typeof def === 'boolean') kind = 'bool';

      // Allow per-field override of "kind" (e.g. select)
      if (o?.kind) kind = String(o.kind);

      // Allow static options via overrides
      const options = Array.isArray(o?.options) ? o.options : null;

      return {
        fieldPath: fp,
        label: this._mergedCfg.labels[fp] ?? fp,
        readonly: this._mergedCfg.readonly.has(fp),
        kind,
        options
      };
    });
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'abf-base-type-editor',
      title: 'Edit',
      template: Templates.Apps.GenericBaseTypeEditor,
      width: 420,
      closeOnSubmit: true
    });
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find('input[name="calculateBaseFromFormula"]').on('change', ev => {
      const isChecked = ev.currentTarget.checked;
      html.find('input[name="base.value"]').prop('disabled', isChecked);
    });
  }

  getData() {
    const values = foundry.utils.getProperty(this.actor, this.path) ?? {};

    const calcFromFormula = Boolean(
      foundry.utils.getProperty(values, 'calculateBaseFromFormula')
    );

    // Prefer the real runtime type from the inflated node at this.path
    const node = foundry.utils.getProperty(this.actor, this.path);
    const realType = node?.constructor?.type ?? this.type;

    const ctor = TypeRegistry.get(realType);
    const dynamicOptions =
      ctor?.getEditorFieldOptions?.(this.actor, { path: this.path }) ?? {};

    // Apply dynamic readonly + dynamic options
    const fields = this._fields.map(f => {
      let out = f;

      if (f.fieldPath === 'base.value' && calcFromFormula) {
        out = { ...out, readonly: true };
      }

      const opt = dynamicOptions[f.fieldPath];
      if (Array.isArray(opt)) {
        out = { ...out, options: opt };
      }

      return out;
    });

    return {
      type: realType,
      path: this.path,
      defaults: this._defaults,
      values,
      fields
    };
  }

  async _updateObject(_event, formData) {
    const update = {};

    const calcFromFormula =
      formData.calculateBaseFromFormula === 'on' ||
      formData.calculateBaseFromFormula === true;

    for (const f of this._fields) {
      if (f.readonly) continue;

      if (f.fieldPath === 'base.value' && calcFromFormula) continue;

      const fullPath = `${this.path}.${f.fieldPath}`;

      if (f.kind === 'bool') {
        update[fullPath] =
          formData[f.fieldPath] === 'on' || formData[f.fieldPath] === true;
        continue;
      }

      if (!(f.fieldPath in formData)) continue;

      let value = formData[f.fieldPath];

      if (f.kind === 'number') value = Number(value);
      else value = String(value);

      update[fullPath] = value;
    }

    await this.actor.update(update);
  }
}
