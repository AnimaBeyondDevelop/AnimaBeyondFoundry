/**
 * Execute a derived function against the actor system.
 *
 * @param {any} actor
 * @param {Function} derivedFn
 */
export async function applyDerived(actor, derivedFn) {
  return derivedFn(actor.system);
}
