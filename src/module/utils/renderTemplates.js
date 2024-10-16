/** @typedef {Object} Templates
 * @property {string} name
 * @property {Record<string, unknown>} [context]

/**
 * Accept multiple rendering templates and returns it rendered
 * @param {Templates[]} templates
 */
export const renderTemplates = (...templates) => {
  return Promise.all(
    templates.map(template => renderTemplate(template.name, template.context ?? {}))
  );
};
