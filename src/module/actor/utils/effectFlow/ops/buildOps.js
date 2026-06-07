import { buildActiveEffectChangeOps } from './builders/buildActiveEffectOps.js';
import { buildDerivedOps } from './builders/buildDerivedOps.js';
import { buildTypedOps } from './builders/buildTypedOps.js';

/**
 * @param {any} actor
 * @param {{derivedFns?: Function[]}} options
 */
export function buildAllFlowOps(actor, options = {}) {
  const derivedFns = options.derivedFns ?? [];

  return [
    ...buildActiveEffectChangeOps(actor),
    ...buildTypedOps(actor),
    ...buildDerivedOps(derivedFns)
  ];
}
