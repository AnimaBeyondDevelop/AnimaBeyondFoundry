import { isMassOfEnemies } from '../actor/utils/massSettings.js';

const BADGE_NAME = 'abf-mass-member-badge';

/**
 * @param {Token} token
 */
function removeMassMemberBadge(token) {
  const existing = token.children?.find?.(child => child.name === BADGE_NAME);
  existing?.destroy?.();
}

/**
 * Draws the current mass member count at the bottom of a token.
 * @param {Token} token
 */
export function drawMassMemberBadge(token) {
  const actor = token.actor;
  if (!actor || !isMassOfEnemies(actor)) {
    removeMassMemberBadge(token);
    return;
  }

  const count = Math.floor(Number(actor.system?.general?.settings?.massMemberCount?.value) || 0);
  if (count <= 0) {
    removeMassMemberBadge(token);
    return;
  }

  const fontSize = Math.max(14, Math.round(token.h * 0.22));
  let badge = token.children?.find?.(child => child.name === BADGE_NAME);

  if (!badge) {
    badge = new PIXI.Text('', {
      fontFamily: 'Signika',
      fontSize,
      fontWeight: 'bold',
      fill: 0xffffff,
      stroke: 0x000000,
      strokeThickness: Math.max(2, Math.round(fontSize * 0.15)),
      align: 'center'
    });
    badge.name = BADGE_NAME;
    badge.anchor.set(0.5, 0);
    badge.eventMode = 'none';
    badge.zIndex = 100;
    token.addChild(badge);
    token.sortChildren?.();
  } else {
    badge.style.fontSize = fontSize;
    badge.style.strokeThickness = Math.max(2, Math.round(fontSize * 0.15));
  }

  badge.text = String(count);
  badge.position.set(0, token.h / 2);
  badge.visible = true;
}

/**
 * @param {object} changes
 */
export function shouldRefreshMassMemberBadge(changes) {
  const flat = foundry.utils.flattenObject(changes?.system ?? {});
  return Object.keys(flat).some(
    key =>
      key.includes('massMemberCount') ||
      key.includes('massOfEnemies') ||
      key.includes('defenseType')
  );
}

/**
 * @param {Actor} actor
 */
export function refreshMassMemberBadgesForActor(actor) {
  for (const tokenDocument of actor.getActiveTokens?.() ?? []) {
    const placeable = tokenDocument.object;
    if (placeable) drawMassMemberBadge(placeable);
  }
}
