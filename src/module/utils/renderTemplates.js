/** @typedef {Object} Templates
 * @property {string} name
 * @property {Record<string, unknown>} [context]

/**
 * Accept multiple rendering templates and returns it rendered
 * @param {Templates[]} templates
 */
export const renderTemplates = (...templates) => {
  const fn = foundry.applications?.handlebars?.renderTemplate ?? renderTemplate;
  return Promise.all(
    templates.map(template => fn(template.name, template.context ?? {}))
  );
};
