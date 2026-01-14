const fs = require('fs');
const path = require('path');

const PSYCHIC_PACKS_DIR = path.join(__dirname, '..', 'src', 'packs', 'psychic_powers');

function parseDamage(text) {
  const match = (text ?? '').match(/Daño\s*(base)?\s*(\d+)/i);
  return match ? parseInt(match[2], 10) : 0;
}

function parseFatigue(text) {
  const match = (text ?? '').match(/Fatiga\s*(\d+)/i);
  return match ? parseInt(match[1], 10) : 0;
}

function parseShieldPoints(text) {
  const effect = (text ?? '').replace('.', '');

  const m1 = effect.match(/(\d+)\s+puntos de resistencia/i);
  if (m1) return parseInt(m1[1], 10) || 0;

  const m2 = effect.match(/(\d+)\s*PV/i);
  if (m2) return parseInt(m2[1], 10) || 0;

  return 0;
}

function parseAffectsInmaterial(text) {
  return /afecta a seres inmateriales/i.test(text ?? '');
}

function ensureEffectStructured(effect) {
  effect.value ??= '';

  effect.damage ??= { value: 0 };
  effect.fatigue ??= { value: 0 };
  effect.shieldPoints ??= { value: 0 };
  effect.affectsInmaterial ??= { value: false };
}

function migratePsychicPowerFile(filePath) {
  const fileName = path.basename(filePath);

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const powerData = JSON.parse(fileContent);

    if (powerData.type !== 'psychicPower') {
      console.log(`  ⊘ Skipping ${fileName} (not a psychicPower)`);
      return;
    }

    let modified = false;

    const effects = powerData.system?.effects ?? {};
    for (const [potency, effect] of Object.entries(effects)) {
      if (!effect) continue;

      // if the template changed, some entries might still be strings
      if (typeof effect === 'string') {
        effects[potency] = { value: effect };
        modified = true;
      }

      ensureEffectStructured(effects[potency]);

      const text = effects[potency].value ?? '';

      const damage = parseDamage(text);
      const fatigue = parseFatigue(text);
      const shieldPoints = parseShieldPoints(text);
      const affectsInmaterial = parseAffectsInmaterial(text);

      if (damage > 0 && effects[potency].damage.value !== damage) {
        effects[potency].damage.value = damage;
        modified = true;
      }

      if (fatigue > 0 && effects[potency].fatigue.value !== fatigue) {
        effects[potency].fatigue.value = fatigue;
        modified = true;
      }

      if (shieldPoints > 0 && effects[potency].shieldPoints.value !== shieldPoints) {
        effects[potency].shieldPoints.value = shieldPoints;
        modified = true;
      }

      if (affectsInmaterial && effects[potency].affectsInmaterial.value !== true) {
        effects[potency].affectsInmaterial.value = true;
        modified = true;
      }
    }

    // write back
    powerData.system.effects = effects;

    if (modified) {
      fs.writeFileSync(filePath, JSON.stringify(powerData, null, 2), 'utf8');
      console.log(`  ✓ Migrated ${fileName}`);
      return true;
    }

    console.log(`  ○ ${fileName} already has structured data`);
    return false;
  } catch (error) {
    console.error(`  ✗ Error processing ${fileName}:`, error.message);
    return false;
  }
}

function migrateAllPsychicPowers() {
  console.log('Starting psychic power migration to structured data format...\n');

  if (!fs.existsSync(PSYCHIC_PACKS_DIR)) {
    console.error(`Error: Psychic packs directory not found at ${PSYCHIC_PACKS_DIR}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(PSYCHIC_PACKS_DIR)
    .filter(file => file.endsWith('.json') && file.startsWith('psychicPower_'));

  console.log(`Found ${files.length} psychic power files\n`);

  let migratedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const file of files) {
    const result = migratePsychicPowerFile(path.join(PSYCHIC_PACKS_DIR, file));
    if (result === true) migratedCount++;
    else if (result === false) skippedCount++;
    else errorCount++;
  }

  console.log('\n' + '='.repeat(60));
  console.log(`Migration complete!`);
  console.log(`  ✓ Migrated: ${migratedCount}`);
  console.log(`  ○ Already migrated: ${skippedCount}`);
  if (errorCount > 0) console.log(`  ✗ Errors: ${errorCount}`);
  console.log('='.repeat(60));
}

migrateAllPsychicPowers();
