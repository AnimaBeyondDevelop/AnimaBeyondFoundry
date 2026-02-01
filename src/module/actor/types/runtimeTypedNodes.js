import { TypeRegistry } from './TypeRegistry.js';

export function buildTypedNodes(actor, typedPaths) {
  actor.typedNodes = new Map();
  for (const [path, type] of typedPaths.entries()) {
    actor.typedNodes.set(path, TypeRegistry.create(type, actor, path));
  }
}

export function applyTypedDerived(actor) {
  if (!actor.typedNodes) return;
  for (const node of actor.typedNodes.values()) {
    node.applyDerived(); // only public entry point
  }
}
