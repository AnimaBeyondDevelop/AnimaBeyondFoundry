/**
 * Orquestador del import de equipo de combate desde el Excel comunitario.
 *
 * El importer base (parseExcelToActor.js) solo procesa la hoja
 * NamedRangesList aplanada. Las armas, armaduras y munición están en otras
 * partes del workbook (named range "Tabla_Combate" y bloque anclado por
 * texto en la hoja "Combate"). Esta función accede al workbook completo
 * para extraer esos bloques y crear los items embebidos correspondientes.
 *
 * Orden de creación (importante): primero la munición, luego las armas.
 * Así podemos pasar a importWeaponsToActor el mapa { nombreAmmoExcel → _id }
 * y enlazar arma → munición vía `system.ammoId`. Sin ese enlace, el dropdown
 * "Munición" de armas de proyectil queda roto en la hoja del PJ.
 *
 * Si el workbook no es el Excel comunitario estándar (named range o header
 * no encontrados) la función no hace nada y avisa al usuario.
 */
import { readWeaponsFromWorkbook, importWeaponsToActor } from './parseWeapons.js';
import { readArmorsFromWorkbook, importArmorsToActor } from './parseArmors.js';
import { importAmmoToActor } from './parseAmmo.js';
import { ABFSettingsKeys } from '../../../../../utils/settingKeys.js';

function notifyNotFound(missing, typeLabel) {
  if (!missing.length) return;
  for (const name of missing) {
    ui.notifications?.warn(
      game.i18n.format('anima.ui.excelImporter.combatEquipment.notifNotFound', {
        type: typeLabel,
        name
      })
    );
  }
}

/**
 * Importa armas, munición y armaduras del Excel al actor.
 *
 * @param {Actor} actor
 * @param {object} workbook  Workbook xlsx ya leído.
 */
export async function importCombatEquipment(actor, workbook) {
  if (!workbook) return;

  const weapons = readWeaponsFromWorkbook(workbook);
  if (weapons === null) {
    ui.notifications?.warn(
      game.i18n.localize('anima.ui.excelImporter.combatEquipment.notifNotExcel')
    );
    return;
  }

  // Ammo primero para tener los _id disponibles al crear las armas.
  const ammoResult = weapons.length
    ? await importAmmoToActor(actor, weapons)
    : { imported: 0, notFound: [], idMap: {} };

  const weaponsResult = weapons.length
    ? await importWeaponsToActor(actor, weapons, ammoResult.idMap)
    : { imported: 0, notFound: [] };

  const armors = readArmorsFromWorkbook(workbook) ?? [];
  const armorsResult = armors.length
    ? await importArmorsToActor(actor, armors)
    : { imported: 0, notFound: [] };

  // Resumen al GM
  ui.notifications?.info(
    game.i18n.format('anima.ui.excelImporter.combatEquipment.notifSummary', {
      weapons: weaponsResult.imported,
      ammo: ammoResult.imported,
      armors: armorsResult.imported
    })
  );

  // Avisos individuales (configurable)
  const shouldNotifyMissing = game.settings.get(
    game.system.id,
    ABFSettingsKeys.NOTIFY_ON_MISSING_EXCEL_MATCH
  );
  if (shouldNotifyMissing) {
    notifyNotFound(
      weaponsResult.notFound,
      game.i18n.localize('anima.ui.excelImporter.combatEquipment.typeWeapon')
    );
    notifyNotFound(
      armorsResult.notFound,
      game.i18n.localize('anima.ui.excelImporter.combatEquipment.typeArmor')
    );
    notifyNotFound(
      ammoResult.notFound,
      game.i18n.localize('anima.ui.excelImporter.combatEquipment.typeAmmo')
    );
  }
}
