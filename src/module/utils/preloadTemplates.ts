import { Templates } from './constants';

export const preloadTemplates = () => {
  const templatePaths = [
    // Add paths to "systems/AnimaBeyondFoundry/templates"
    Templates.Dialog.ModDialog,
    Templates.Dialog.Icons.Accept,

    // Actor sheet parts
    'systems/animabf/templates/parts/combat.html',
    'systems/animabf/templates/parts/domine.html',
    'systems/animabf/templates/parts/psychic.hbs',
    'systems/animabf/templates/parts/main/general.hbs',
    'systems/animabf/templates/parts/main/parts/level.hbs',
    'systems/animabf/templates/parts/main/parts/language.hbs',
    'systems/animabf/templates/parts/main/parts/elan.hbs',
    'systems/animabf/templates/parts/main/parts/titles.hbs',
    'systems/animabf/templates/parts/main/parts/experience.hbs',
    'systems/animabf/templates/parts/main/parts/advantages.hbs',
    'systems/animabf/templates/parts/main/parts/disadvantages.hbs',
    'systems/animabf/templates/parts/main/parts/aspect.hbs',
    'systems/animabf/templates/parts/main/parts/description.hbs',
    'systems/animabf/templates/parts/main/parts/contacts.hbs',
    'systems/animabf/templates/parts/main/parts/notes.hbs',
    'systems/animabf/templates/parts/mystic.html',
    'systems/animabf/templates/parts/secondaries.html'
  ];

  return loadTemplates(templatePaths);
};
