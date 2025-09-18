// scripts/compendia/updateCompendiums.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_DIR = path.resolve(__dirname, '../../src/packs');
const TARGET_SYSTEM_ID = 'abf';
const TARGET_SYSTEM_VERSION = '1.0.0';
const TARGET_CORE_VERSION = '13.345';

function processJsonFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(content);

  if (data._stats) {
    data._stats.systemId = TARGET_SYSTEM_ID;
    data._stats.systemVersion = TARGET_SYSTEM_VERSION;
    data._stats.coreVersion = TARGET_CORE_VERSION;

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`✔️ Actualizado: ${filePath}`);
  }
}

fs.readdirSync(BASE_DIR).forEach(compendiumFolder => {
  const compendiumPath = path.join(BASE_DIR, compendiumFolder);
  if (!fs.statSync(compendiumPath).isDirectory()) return;

  fs.readdirSync(compendiumPath)
    .filter(file => file.endsWith('.json'))
    .forEach(file => {
      processJsonFile(path.join(compendiumPath, file));
    });
});
