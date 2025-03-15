/**
 * Parses the properties in an object into a string that can be passed to an element's style to define
 * corresponding custom CSS properties.
 *
 * @param  {Record<string,string|undefined>} properties Object containing CSS properties to be parsed.
 * @example
 * // returns "--height: 10px; --width: 100%"
 * parseCssCustomProperties({height: "10px", width: "100%"})
 * @returns {string}
 */
export function parseCssCustomProperties(properties) {
  let definedProps = Object.entries(properties).filter(prop => prop[1] !== undefined);
  return definedProps.map(k => `--${k.join(': ')};`).join(' ');
}
