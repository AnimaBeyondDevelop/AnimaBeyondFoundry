import { buildAllFlowOps } from './ops/buildOps';
import { orderFlowOps } from './toposort';

/**
 * Build -> order -> apply the flow operations.
 *
 * @param {any} actor
 * @param {{ derivedFns?: Function[], debug?: boolean }} options
 * @returns {Promise<any[]>} ordered ops (useful for debugging/tests)
 */
export async function runEffectFlow(actor, options = {}) {
  const ops = buildAllFlowOps(actor, options);
  const ordered = orderFlowOps(ops);

  for (const op of ordered) {
    // Debug-friendly hook
    if (options.debug) {
      // eslint-disable-next-line no-console
      console.log('[effectFlow] apply', op.id, { deps: op.deps, mods: op.mods });
    }

    await op.apply(actor);
  }

  return ordered;
}
