import { BaseType } from '../BaseType.js';

export class CustomAttribute extends BaseType {
  static type = 'CustomAttribute';

  static defaults() {
    return {
      dataType: 'number',
      stringData: '',
      boolData: false,
      numberData: 0
    };
  }

  static normalizeInflateInput(node) {
    if (!node || typeof node !== 'object') return node;

    const out = { ...node };

    const nested = out.system && typeof out.system === 'object' ? out.system : null;
    if (nested) {
      out.dataType = nested.dataType?.value ?? nested.tipo?.value ?? out.dataType;
      out.stringData = nested.stringData?.value ?? out.stringData;
      out.boolData = nested.boolData?.value ?? out.boolData;
      out.numberData = nested.numberData?.value ?? out.numberData;
      delete out.system;
    }

    if (out.tipo !== undefined && out.dataType === undefined) {
      out.dataType = out.tipo?.value ?? out.tipo;
    }

    if (out.dataType && typeof out.dataType === 'object' && 'value' in out.dataType) {
      out.dataType = out.dataType.value;
    }
    if (out.stringData && typeof out.stringData === 'object' && 'value' in out.stringData) {
      out.stringData = out.stringData.value;
    }
    if (out.boolData && typeof out.boolData === 'object' && 'value' in out.boolData) {
      out.boolData = out.boolData.value;
    }
    if (out.numberData && typeof out.numberData === 'object' && 'value' in out.numberData) {
      out.numberData = out.numberData.value;
    }

    const dataType = String(out.dataType ?? 'number').toLowerCase();
    out.dataType = ['bool', 'string', 'number'].includes(dataType) ? dataType : 'number';
    out.stringData = String(out.stringData ?? '');
    out.boolData = out.boolData === true || out.boolData === 'true' || out.boolData === 1;

    const numberData = Number(out.numberData ?? 0);
    out.numberData = Number.isFinite(numberData) ? numberData : 0;

    delete out.tipo;

    return out;
  }

  static editorConfig() {
    return {
      readonly: ['key'],
      hidden: [],
      labels: {
        key: 'Key',
        dataType: 'Tipo',
        stringData: 'String',
        boolData: 'Bool',
        numberData: 'Number'
      },
      order: ['key', 'dataType', 'stringData', 'boolData', 'numberData'],
      overrides: {
        dataType: {
          kind: 'select',
          options: [
            { value: 'string', label: 'string' },
            { value: 'bool', label: 'bool' },
            { value: 'number', label: 'number' }
          ]
        }
      }
    };
  }
}

