export type Templates = {
  name: string;
  context?: Record<string, unknown>;
};

/**
 * Accept multiple rendering templates and returns it rendered
 * @param templates
 */
export const renderTemplates = (...templates: Templates[]): Promise<string[]> => {
  return Promise.all(templates.map(template => renderTemplate(template.name, template.context ?? {})));
};
