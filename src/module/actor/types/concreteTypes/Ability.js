import { AffectedByCharacteristicValue } from './AffectedByCharacteristicValue.js';
import { ABFSettingsKeys } from '../../../../utils/settingKeys.js';
import { applyWithstandPainMitigation } from '../../utils/prepareActor/calculations/actor/modifiers/calculations/withstandPainMitigation.js';

export class Ability extends AffectedByCharacteristicValue {
  static type = 'Ability';

  get applyAllActionMod() {
    return this._get('applyAllActionMod', true);
  }

  get applyPhysicalActionMod() {
    const v = this._get('applyPhysicalActionMod', undefined);
    if (v !== undefined) return v;

    const ATTRIBUTES_AFFECTED_BY_PHYSICAL_PENALTIES = [
      'agility',
      'dexterity',
      'strength',
      'constitution'
    ];

    return ATTRIBUTES_AFFECTED_BY_PHYSICAL_PENALTIES.includes(this.attribute);
  }

  static defaults() {
    return {
      ...super.defaults(),
      applyAllActionMod: true,
      applyPhysicalActionMod: true
    };
  }

  static normalizeInflateInput(node) {
    const out = super.normalizeInflateInput(node);
    if (!out || typeof out !== 'object') return out;

    if (typeof out.applyAllActionMod !== 'boolean') out.applyAllActionMod = true;

    const ATTRIBUTES_AFFECTED_BY_PHYSICAL_PENALTIES = [
      'agility',
      'dexterity',
      'strength',
      'constitution'
    ];

    if (typeof out.applyPhysicalActionMod !== 'boolean') {
      out.applyPhysicalActionMod = ATTRIBUTES_AFFECTED_BY_PHYSICAL_PENALTIES.includes(
        out.attribute
      );
    }

    return out;
  }

  static editorConfig() {
    const base = super.editorConfig();

    return {
      ...base,
      labels: {
        ...(base.labels ?? {}),
        applyAllActionMod: 'Apply all action modifier',
        applyPhysicalActionMod: 'Apply physical action modifier'
      },
      order: [...(base.order ?? []), 'applyAllActionMod', 'applyPhysicalActionMod']
    };
  }

  _computeFinal({ base = 0, special = 0 }) {
    let { final } = super._computeFinal({ base, special });

    final += Number(this._computeMods());

    return { final };
  }

  _isWithstandPain() {
    return (
      typeof this.systemPath === 'string' && this.systemPath.endsWith('.withstandPain')
    );
  }

  _withstandPainIgnoresFatigueAndPain() {
    try {
      return !!game.settings.get(
        game.animabf.id,
        ABFSettingsKeys.WITHSTAND_PAIN_IGNORES_FATIGUE_AND_PAIN
      );
    } catch {
      return true;
    }
  }

  /**
   * Mitigated fatigue+pain contribution currently folded into allActions.base.
   * @returns {number}
   */
  _mitigatedFatiguePainContribution() {
    const penalties = this.actor?.system?.general?.modifiers?.allActionsPenalties;
    if (!penalties) return 0;
    return applyWithstandPainMitigation(
      penalties.fatigue?.final?.value,
      penalties.pain?.final?.value,
      penalties.withstandPainMitigation?.value
    );
  }

  /**
   *
   * Calculates ability mod
   * @returns {Number}
   */
  _computeMods() {
    let result = 0;
    if (this.applyAllActionMod) {
      let allActions = Number(
        this.actor?.system?.general?.modifiers?.allActions?.final?.value ?? 0
      );

      if (this._isWithstandPain() && this._withstandPainIgnoresFatigueAndPain()) {
        allActions -= this._mitigatedFatiguePainContribution();
      }

      result += allActions;
    }

    if (this.applyPhysicalActionMod) {
      result += Number(
        this.actor?.system?.general?.modifiers?.physicalActions?.final?.value ?? 0
      );
    }
    return result;
  }

  getDerivedFlowSpecs() {
    const specs = super.getDerivedFlowSpecs();
    const finalSpec = specs.find(s => s.id === 'final');

    if (finalSpec) {
      // keep super deps, just add toggles
      finalSpec.deps = [...finalSpec.deps, 'applyAllActionMod', 'applyPhysicalActionMod'];
      finalSpec.compute = this._computeFinal.bind(this);

      const extraDeps = [];

      if (this.applyAllActionMod) {
        extraDeps.push('system.general.modifiers.allActions.final.value');
        if (this._isWithstandPain()) {
          extraDeps.push(
            'system.general.modifiers.allActionsPenalties.fatigue.final.value',
            'system.general.modifiers.allActionsPenalties.pain.final.value',
            'system.general.modifiers.allActionsPenalties.withstandPainMitigation.value'
          );
        }
      }
      if (this.applyPhysicalActionMod) {
        extraDeps.push('system.general.modifiers.physicalActions.final.value');
      }

      if (extraDeps.length) {
        // merge with existing instance deps set by parent (characteristic deps)
        const current = this.getInstanceDeps?.('final') ?? null; // if you don't have getter, ignore this line
        this.setInstanceDeps('final', [...(current ?? []), ...extraDeps]);
      }
    }

    return this._mergeInstanceDeps(specs);
  }
}
