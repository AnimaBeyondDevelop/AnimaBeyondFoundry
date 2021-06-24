import { Templates } from './constants';

export const preloadTemplates = () => {
  const templatePaths = [
    // Add paths to "systems/AnimaBeyondFoundry/templates"
    Templates.Dialog.ModDialog,

    // Actor sheet parts
    'systems/animabf/templates/parts/combat.html',
    'systems/animabf/templates/parts/domine.html',
    'systems/animabf/templates/parts/elan.html',
    'systems/animabf/templates/parts/main.html',
    'systems/animabf/templates/parts/mystic.html',
    'systems/animabf/templates/parts/secondaries.html'
  ];

  return loadTemplates(templatePaths);
};
