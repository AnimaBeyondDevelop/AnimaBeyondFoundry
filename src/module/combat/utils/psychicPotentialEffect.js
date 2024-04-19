/**
 * Calculates the effect of psychic potential based on different factors.
 * 
 * @param {number} potential - The psychic potential value.
 * @param {number} imbalance - The imbalance factor.
 * @param {boolean} inhuman - Indicates if the psychic is inhuman.
 * @param {boolean} zen - Indicates if the psychic is in a zen state.
 * @returns {number} The calculated effect of psychic potential.
 */
export const difficultyRange = [20, 40, 80, 120, 140, 180, 240, 280, 320, 440];
export const psychicPotentialEffect = (potential, imbalance, inhuman, zen) => {
    let max = zen ? 9 : inhuman ? 8 : 7;
    if (potential < 40) { return difficultyRange[0 + imbalance] }
    else if (potential < 80) { return difficultyRange[1 + imbalance] }
    else if (potential < 120) { return difficultyRange[2 + imbalance] }
    else if (potential < 140) { return difficultyRange[3 + imbalance] }
    else if (potential < 180) { return difficultyRange[4 + imbalance] }
    else if (potential < 240) { return difficultyRange[5 + imbalance] }
    else if (potential < 280) { return difficultyRange[6 + imbalance] }
    else if (potential < 320) { return difficultyRange[Math.min(max, 7 + imbalance)] }
    else if (potential < 440) { return difficultyRange[Math.min(max, 8 + imbalance)] }
    else { return difficultyRange[Math.min(max, 9)] }
}