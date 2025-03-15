/**
 * Rounds a number to a multiple using a given rounding function.
 * @param {number} number - The number to be rounded.
 * @param {number} multiple - The multiple which the number will be rounded to.
 * @param {(n: number) => number} roundingFunction - The rounding function to be used.
 */
export function roundToMultiple(number, multiple, roundingFunction) {
  return roundingFunction(number / multiple) * multiple;
}

/**
 * Ceils a number to a multiple.
 * @param {number} number - The number to be rounded.
 * @param {number} multiple - The multiple which the number will be rounded to.
 */
export function ceilToMultiple(number, multiple) {
  return roundToMultiple(number, multiple, Math.ceil);
}

/**
 * Floors a number to a multiple.
 * @param {number} number - The number to be rounded.
 * @param {number} multiple - The multiple which the number will be rounded to.
 */
export function floorToMultiple(number, multiple) {
  return roundToMultiple(number, multiple, Math.floor);
}

/**
 * Floors a number to a multiple of 5.
 * @param {number} number - The number to be rounded.
 */
export function floorTo5Multiple(number) {
  return floorToMultiple(number, 5);
}
