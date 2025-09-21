import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);
const sys = require(path.resolve(__dirname, '../../system.json'));

export const SYSTEM_ID = sys.id;
export const SYSTEM_VERSION = sys.version;
export const CORE_VERSION =
  sys.compatibleCoreVersion ?? sys.coreVersion ?? sys.minimumCoreVersion ?? '';
