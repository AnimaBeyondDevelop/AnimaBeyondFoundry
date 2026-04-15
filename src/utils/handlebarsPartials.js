// Registers a set of Handlebars partials from a name → templatePath map
export async function registerHandlebarsPartials(partialsMap) {
  if (!partialsMap || typeof partialsMap !== 'object') return;

  for (const [name, path] of Object.entries(partialsMap)) {
    if (!name || !path) continue;

    const fn = foundry.applications?.handlebars?.getTemplate ?? getTemplate;
    const compiled = await fn(path);
    Handlebars.registerPartial(name, compiled);
  }
}
