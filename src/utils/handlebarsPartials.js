// Registers a set of Handlebars partials from a name → templatePath map
export async function registerHandlebarsPartials(partialsMap) {
  if (!partialsMap || typeof partialsMap !== 'object') return;

  for (const [name, path] of Object.entries(partialsMap)) {
    if (!name || !path) continue;

    const compiled = await getTemplate(path);
    Handlebars.registerPartial(name, compiled);
  }
}
