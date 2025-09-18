import { Logger } from '../../utils';
import { ABFSettingsKeys } from '../../utils/registerSettings';
import { ABFActor } from '../actor/ABFActor';
import { ABFDialogs } from '../dialogs/ABFDialogs';
import ABFItem from '../items/ABFItem';
import isVersionGreater from '@module/utils/functions/isVersionGreater';
import * as MigrationList from './migrations';

/** @typedef {import('./migrations/Migration').Migration} Migration */

/**
 * @param {Migration} migration
 * @returns {boolean} Wether the migration applies or not.
 */
function migrationApplies(migration) {
  /** @type {number} */
  const createdWith =
    game.settings.get(game.abf.id, ABFSettingsKeys.WORLD_CREATION_SYSTEM_VERSION) ??
    '0.0.0';
  const applied = game.settings.get(game.abf.id, ABFSettingsKeys.APPLIED_MIGRATIONS);

  const alreadyApplied = applied[migration.id];
  const wasCreatedAfter = !isVersionGreater(migration.version, createdWith);

  if (alreadyApplied || wasCreatedAfter) return false;

  return true;
}

/**
 * Migrates a collection of items. If the collection are items belonging to an actor or pack,
 * a context needs to be provided for the `updateDocuments(...)` function.
 * @param {ABFItem[]} items
 * @param {Migration} migration
 * @param {{parent: ABFActor} | {pack: string} | {}} context - context for the Item.updateDocuments call
 */
async function migrateItemCollection(items, migration, context = {}) {
  if (migration.filterItems) items = items.filter(migration.filterItems);
  const length = items.length ?? items.size; // takes care of the case of a DocumentCollection

  if (length === 0 || !migration.updateItem) return;
  Logger.log(`Migrating ${length} Items.`);

  const migrated = await Promise.all(items.map(i => migration.updateItem(i)));

  const updates = migrated
    .map(i => {
      if (!i) return;
      const { _id, name, system } = i;
      return { _id, name, system };
    })
    .filter(u => u);

  await ABFItem.updateDocuments(updates, context);
}

/**
 * Migrates a collection of actors, applying the migration to their owned items also.
 * @param {ABFActor[]} actors
 * @param {Migration} migration
 * @param {{parent: ABFActor} | {pack: string} | {}} context - context for the updateDocuments calls
 */
async function migrateActorCollection(actors, migration, context = {}) {
  if (migration.filterActors) actors = actors.filter(migration.filterActors);
  const length = actors.length ?? actors.size; // takes care of the case of a DocumentCollection
  if (length === 0 || (!migration.updateItem && !migration.updateActor)) return;
  Logger.log(`Migrating ${length} Actors.`);

  if (migration.updateItem) {
    await Promise.all(
      actors.map(async a => migrateItemCollection(a.items, migration, { parent: a }))
    );
  }
  if (migration.updateActor) {
    const migrated = await Promise.all(actors.map(a => migration.updateActor(a)));
    const updates = migrated
      .map(a => {
        if (!a) return;
        const { _id, name, system } = a;
        return { _id, name, system };
      })
      .filter(u => !!u);
    await ABFActor.updateDocuments(updates, context);
  }
}

/**
 * Migrates the actors from unlinked tokens presents on a collection of scenes
 * @param {Scene[]} scenes
 * @param {Migration} migration
 * @param {{parent: ABFActor} | {pack: string} | {}} context - context for the updateDocuments calls
 */
async function migrateUnlinkedActors(scenes, migration, context) {
  const length = items.length || items.size; // takes care of the case of a DocumentCollection
  if (length === 0 || (!migration.updateItem && !migration.updateActor)) return;

  // This has to be performed individually instead of using directly migrateItemCollection() and
  // migrateActorCollection() since unlinked (syntetic) actors won't get updated on batch
  // Actors.updateDocuments() updates. {parent: TOKEN} has to be specified for the update to be
  // completed.
  for (const scene of scenes) {
    for (const token of scene.tokens.filter(token => !token.actorLink && token.actor)) {
      await migrateActorCollection([token.actor], migration, { parent: token });
    }
  }
}

/**
 * Migrates world items
 * @param {Migration} migration
 */
async function migrateWorldItems(migration) {
  if (!migration.updateItem) return;
  await migrateItemCollection(game.items, migration);
}

/**
 * Migrates world actors (including unlinked tokens on world's scenes), and their owned items.
 * @param {Migration} migration
 */
async function migrateWorldActors(migration) {
  if (!migration.updateActor && !migration.updateItem) return;

  migrateActorCollection(game.actors, migration);
  migrateUnlinkedActors(game.scenes, migration);
}

/**
 * @param {Migration} migration
 */
async function migratePacks(migration) {
  // load packs with actors, items or scenes
  const packTypes = migration.updateItem
    ? ['Actor', 'Item', 'Scene']
    : ['Actor', 'Scene'];

  let packs = await Promise.all(
    game.packs
      .filter(pack => packTypes.includes(pack.metadata.type))
      .map(async pack => {
        const packObj = {
          pack: pack,
          wasLocked: pack.locked,
          id: pack.metadata.id,
          type: pack.metadata.type
        };
        await pack.configure({ locked: false });
        packObj.documents = await pack.getDocuments();
        return packObj;
      })
  );

  const migrate = {
    Actor: migrateActorCollection,
    Item: migrateItemCollection,
    Scene: migrateUnlinkedActors
  };
  await Promise.all(
    packs.map(pack => migrate[pack.type](pack.documents, migration, { pack: pack.id }))
  );
  // Lock again packs which where locked
  await Promise.all(
    packs
      .filter(packObject => packObject.wasLocked)
      .map(async packObject => {
        await packObject.pack.configure({ locked: true });
      })
  );
}

/**
 * @param {Migration} migration
 * @todo Implement this function
 */
function migrateTokens(migration) {
  if (migration.updateToken) {
    throw new Error(
      'AnimaBF | Trying to update tokens with a migration, but `migrateTokens()` function in `migrate.js` not defined yet'
    );
  }
}

/**
 * @param {Migration} migration - The migration version to be applied
 * @returns {Promise<boolean>} - Whether the migration has been succesfully applied or not.
 */
async function applyMigration(migration) {
  try {
    Logger.log(`Applying migration ${migration.id}.`);

    await migrateWorldItems(migration);
    await migrateWorldActors(migration);
    await migratePacks(migration);
    migrateTokens(migration);
    migration.migrate?.();

    Logger.log(`Migration ${migration.id} completed.`);

    const currentVersion = game.system.version;
    const applied = game.settings.get(game.abf.id, ABFSettingsKeys.APPLIED_MIGRATIONS);
    applied[migration.id] = currentVersion;
    game.settings.set(game.abf.id, ABFSettingsKeys.APPLIED_MIGRATIONS, applied);

    // TODO: add french translation for the warning dialog also.
    await ABFDialogs.prompt(
      game.i18n.format('dialogs.migrations.success', {
        version: migration.version,
        title: migration.title
      })
    );
    return true;
  } catch (err) {
    Logger.error(`Error when trying to apply migration ${migration.version}:\n${err}`);
    await ABFDialogs.prompt(
      game.i18n.format('dialogs.migrations.error', {
        version: migration.version,
        error: err
      })
    );
  }
  return false;
}

/** This is the only function on the script meant to be called from outside the script */
export async function applyMigrations() {
  if (!game.user.isGM) {
    return;
  }

  const migrations = Object.values(MigrationList).filter(migration =>
    migrationApplies(migration)
  );
  migrations.sort((a, b) => {
    if (a.version !== b.version) return isVersionGreater(a.version, b.version) ? 1 : -1;
    return (a.order ?? 0) - (b.order ?? 0);
  });

  for (const migration of migrations) {
    const result = await ABFDialogs.confirm(
      game.i18n.localize('dialogs.migrations.title'),
      `${game.i18n.localize('dialogs.migrations.content')}<br><hr><br>` +
        '<h4>Details of the migration (only English available):</h4>' +
        `<strong>Title:</strong> ${migration.title}<br>` +
        `<strong>Description:</strong> ${migration.description}`
    );
    if (result === 'confirm') {
      await applyMigration(migration);
    } else {
      break;
    }
  }
}
