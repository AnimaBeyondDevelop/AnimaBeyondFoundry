const fs = require('fs');
const path = require('path');

const MAGIC_PACKS_DIR = path.join(__dirname, '..', 'src', 'packs', 'magic');

function parseDamage(description) {
  const match = description.match(/Daño *(base)* *(\d+)/i);
  return match ? parseInt(match[2], 10) : 0;
}

function parseArea(description) {
  const match = description.match(/[Áá]rea de (\d+) metros/i);
  return match ? parseInt(match[1], 10) : 0;
}

function parseResistanceEffect(description) {
  const resistances = {
    physical: 'RF',
    disease: 'RE',
    poison: 'RV',
    magic: 'RM',
    psychic: 'RP'
  };

  for (const [type, code] of Object.entries(resistances)) {
    const beforePattern = new RegExp(`(\\d+) *[RFEVMP]{0,2} *o* *${code}`, 'i');
    const afterPattern = new RegExp(`${code} *o* *[RFEVMP]{0,2} *(\\d+)`, 'i');

    let match = description.match(beforePattern);
    if (match) return { value: parseInt(match[1], 10), type };

    match = description.match(afterPattern);
    if (match) return { value: parseInt(match[1], 10), type };
  }

  return { value: 0, type: null };
}

function migrateSpellFile(filePath) {
  const fileName = path.basename(filePath);

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const spellData = JSON.parse(fileContent);

    if (spellData.type !== 'spell') {
      console.log(`  ⊘ Skipping ${fileName} (not a spell)`);
      return;
    }

    let modified = false;
    const grades = ['base', 'intermediate', 'advanced', 'arcane'];

    for (const gradeName of grades) {
      const grade = spellData.system?.grades?.[gradeName];
      if (!grade) continue;

      const description = grade.description?.value || '';
      const damage = parseDamage(description);
      const area = parseArea(description);
      const resistanceEffect = parseResistanceEffect(description);

      if (damage > 0 && !grade.damage) {
        grade.damage = { value: damage };
        modified = true;
      } else if (grade.damage && grade.damage.value !== damage && damage > 0) {
        console.log(`  ⚠ ${fileName} [${gradeName}]: damage mismatch`);
      }

      if (area > 0 && !grade.area) {
        grade.area = { value: area };
        modified = true;
      } else if (grade.area && grade.area.value !== area && area > 0) {
        console.log(`  ⚠ ${fileName} [${gradeName}]: area mismatch`);
      }

      if (resistanceEffect.value > 0 && !grade.resistanceEffect) {
        grade.resistanceEffect = resistanceEffect;
        modified = true;
      } else if (
        grade.resistanceEffect &&
        (grade.resistanceEffect.value !== resistanceEffect.value ||
         grade.resistanceEffect.type !== resistanceEffect.type) &&
        resistanceEffect.value > 0
      ) {
        console.log(`  ⚠ ${fileName} [${gradeName}]: resistance mismatch`);
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, JSON.stringify(spellData, null, 2), 'utf8');
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

function migrateAllSpells() {
  console.log('Starting spell migration to structured data format...\n');

  if (!fs.existsSync(MAGIC_PACKS_DIR)) {
    console.error(`Error: Magic packs directory not found at ${MAGIC_PACKS_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(MAGIC_PACKS_DIR)
    .filter(file => file.endsWith('.json') && file.startsWith('spell_'));

  console.log(`Found ${files.length} spell files\n`);

  let migratedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const file of files) {
    const result = migrateSpellFile(path.join(MAGIC_PACKS_DIR, file));
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

migrateAllSpells();
