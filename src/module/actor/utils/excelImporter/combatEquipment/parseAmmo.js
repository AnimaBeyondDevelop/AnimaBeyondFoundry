/**
 * Parser de munición.
 *
 * La munición se extrae de la fila AMMO dentro de Tabla_Combate (no de un
 * bloque separado). Esta función deduplica por nombre y enlaza la munición
 * con las armas que la usan en el actor.
 *
 * El pack 'animabf.weapons' mezcla armas y munición: las 16 municiones
 * conocidas (Saeta, Balas, Virote ligero, Piedras de honda, etc.) están
 * dentro de ese pack con type='ammo'. compendiumMatch.js las filtra.
 */
import { findInCompendium, cloneCompendiumItem } from './compendiumMatch.js';

function buildUniqueAmmoMap(weapons) {
  const map = new Map();
  for (const w of weapons) {
    if (!w.ammo || w.ammo === '-' || w.ammo === '0') continue;
    const key = String(w.ammo).trim();
    if (!map.has(key)) {
      map.set(key, {
        name: key,
        quality: Number(w.ammoQuality) || 0,
        associatedWeapons: [w.name]
      });
    } else {
      map.get(key).associatedWeapons.push(w.name);
    }
  }
  return map;
}

/**
 * Crea un item de tipo 'ammo' por cada munición única encontrada en la
 * Tabla_Combate. Vincula al compendio cuando hay match; si no, crea un
 * item suelto con schema mínimo y lo marca como unmatched.
 *
 * @returns {{ imported: number, notFound: string[], idMap: Object }}
 *   idMap: { nombreExcelDeLaMunición: _id del item creado en el actor }.
 *   El idMap permite a importWeaponsToActor enlazar arma → munición vía
 *   `system.ammoId`, que es el campo que usa el sistema para resolver la
 *   munición asociada.
 */
export async function importAmmoToActor(actor, weapons) {
  const ammoMap = buildUniqueAmmoMap(weapons);
  if (ammoMap.size === 0) return { imported: 0, notFound: [], idMap: {} };

  const items = [];
  const notFound = [];

  for (const ammo of ammoMap.values()) {
    const doc = await findInCompendium('ammo', ammo.name);

    if (doc) {
      const override = { quality: { value: ammo.quality } };
      const itemData = cloneCompendiumItem(doc, override);
      itemData.flags = itemData.flags || {};
      itemData.flags.animabf = itemData.flags.animabf || {};
      itemData.flags.animabf.excelImport = {
        fromExcel: true,
        excelName: ammo.name,
        associatedWeapons: ammo.associatedWeapons
      };
      items.push(itemData);
      continue;
    }

    notFound.push(ammo.name);
    items.push({
      name: ammo.name,
      type: 'ammo',
      system: {
        amount: { value: 0 },
        quality: { value: ammo.quality },
        critic: { value: 'cut' },
        damage: { base: { value: 0 }, final: { value: 0 } },
        integrity: { base: { value: 0 }, final: { value: 0 } },
        breaking: { base: { value: 0 }, final: { value: 0 } },
        presence: { base: { value: 0 }, final: { value: 0 } },
        reducedArmor: {
          base: { value: 0 },
          special: { value: 0 },
          final: { value: 0 }
        },
        special: { value: '' }
      },
      flags: {
        animabf: {
          excelImport: {
            unmatched: true,
            fromExcel: true,
            excelName: ammo.name,
            associatedWeapons: ammo.associatedWeapons
          }
        }
      }
    });
  }

  const created = await actor.createEmbeddedDocuments('Item', items);

  // El orden del array `created` NO es fiable: Foundry puede reordenar al
  // crear el batch. Construimos el idMap matcheando por el flag
  // `excelImport.excelName` que pusimos en cada item.
  const idMap = {};
  for (const doc of created) {
    const excelName = doc?.flags?.animabf?.excelImport?.excelName
      ?? doc?.getFlag?.('animabf', 'excelImport')?.excelName;
    if (excelName && doc._id) idMap[excelName] = doc._id;
  }

  return { imported: items.length, notFound, idMap };
}
