// Ensures concrete types are registered before reading defaults
import './typeRegistryLoader.js';

import { INITIAL_ACTOR_DATA } from '../constants.js';
import { collectTypedFromTemplate } from './collectTypedFromTemplate.js';

export const { typedPaths: TYPED_PATHS, typedDefaults: TYPED_DEFAULTS } =
  collectTypedFromTemplate(INITIAL_ACTOR_DATA, 'system');
