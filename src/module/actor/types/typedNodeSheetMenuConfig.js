import { deleteCustomAttribute } from '../utils/buttonCallbacks/customAttributes.js';
import { deleteSecondarySpecialSkill } from '../utils/buttonCallbacks/secondarySpecialSkills.js';

/**
 * Dev-only registry: typed node paths that may show "Delete" in the actor sheet
 * context menu. Add entries here when a dynamic typed node group should be
 * removable from the sheet (static template secondaries stay edit-only).
 *
 * @typedef {{
 *   id: string,
 *   pathPrefix: string,
 *   type?: string,
 *   onDelete: (sheet: import('../ABFActorSheet').default, target: HTMLElement) => Promise<void> | void
 * }} TypedNodeDeletableConfig
 */

/** @type {TypedNodeDeletableConfig[]} */
export const TYPED_NODE_DELETABLE_CONFIG = [
  {
    id: 'secondarySpecialSkills',
    pathPrefix: 'system.secondaries.secondarySpecialSkills.',
    type: 'SecondaryAbility',
    onDelete: deleteSecondarySpecialSkill
  },
  {
    id: 'customAttributes',
    pathPrefix: 'system.effects.customAttributes.',
    type: 'CustomAttribute',
    onDelete: deleteCustomAttribute
  }
];

/**
 * @param {string} systemPath
 * @param {import('./BaseType.js').BaseType | null | undefined} typedNode
 * @returns {TypedNodeDeletableConfig | null}
 */
export function resolveTypedNodeDeletableConfig(systemPath, typedNode = null) {
  const path = String(systemPath ?? '');

  for (const cfg of TYPED_NODE_DELETABLE_CONFIG) {
    if (!path.startsWith(cfg.pathPrefix)) continue;

    const nodeType = typedNode?.constructor?.type;
    if (cfg.type && nodeType !== cfg.type) continue;

    return cfg;
  }

  return null;
}

/**
 * @param {import('../ABFActor').ABFActor} actor
 * @param {string} systemPath
 * @returns {boolean}
 */
export function isTypedNodeDeletable(actor, systemPath) {
  const typedNode = actor?.typedNodes?.get(systemPath) ?? null;
  return resolveTypedNodeDeletableConfig(systemPath, typedNode) != null;
}
