/**
 * Table 15 — Resist Pain: amount of fatigue+pain penalty annulled by skill total / roll.
 * @type {ReadonlyArray<{ min: number, annulled: number }>}
 */
export const WITHSTAND_PAIN_MITIGATION_TABLE = Object.freeze([
  { min: 80, annulled: 10 },
  { min: 120, annulled: 20 },
  { min: 140, annulled: 30 },
  { min: 180, annulled: 40 },
  { min: 240, annulled: 50 },
  { min: 280, annulled: 60 },
  { min: 320, annulled: 70 },
  { min: 440, annulled: 80 }
]);

/**
 * @param {number} score Skill total or roll result (Cantidad)
 * @returns {number} Positive amount of negative penalty annulled
 */
export function getWithstandPainMitigation(score) {
  const value = Number(score) || 0;
  let annulled = 0;
  for (const row of WITHSTAND_PAIN_MITIGATION_TABLE) {
    if (value >= row.min) annulled = row.annulled;
  }
  return annulled;
}

/**
 * Contribution of fatigue+pain after withstand-pain mitigation (always ≤ 0).
 * @param {number} fatigueFinal
 * @param {number} painFinal
 * @param {number} mitigation Positive annulled amount
 * @returns {number}
 */
export function applyWithstandPainMitigation(fatigueFinal, painFinal, mitigation) {
  const fatiguePain = (Number(fatigueFinal) || 0) + (Number(painFinal) || 0);
  const mitigationValue = Math.max(0, Number(mitigation) || 0);
  return Math.min(0, fatiguePain + mitigationValue);
}
