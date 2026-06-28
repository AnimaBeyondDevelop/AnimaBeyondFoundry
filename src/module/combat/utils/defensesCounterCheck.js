/** @param {number} accumulated */
export function multipleDefensePenaltyFromAccumulated(accumulated) {
  const a = Math.max(0, Number(accumulated) || 0);
  if (a <= 0) return 0;
  if (a === 1) return 30;
  if (a === 2) return 50;
  if (a === 3) return 70;
  return 90;
}

/**
 * @param {{ accumulated?: number, keepAccumulating?: boolean } | null | undefined} defensesCounter
 */
export function getAccumulatedDefenses(defensesCounter) {
  const keep = defensesCounter?.keepAccumulating ?? true;
  const acc = Math.max(0, Number(defensesCounter?.accumulated) || 0);
  return keep ? acc : 0;
}

/** UI / manual defense dialog: negative modifier for the roll formula. */
export const defensesCounterCheck = accumulated => {
  const multipleDefensesPenalty = [-0, -30, -50, -70, -90];
  const currentDefensePenalty =
    multipleDefensesPenalty[Math.min(Math.max(0, Number(accumulated) || 0), 4)];
  return currentDefensePenalty;
};
