import { ABFSettingsKeys } from '../../utils/registerSettings';
import { ABFActor } from '../actor/ABFActor';
import { ABFDialogs } from '../dialogs/ABFDialogs';
import * as MigrationList from './migrations';

/** @typedef {import('./migrations/Migration').Migration} Migration */

/**
 * @param {Migration} migration
 * @returns {boolean} Wether the migration applies or not.
 */
function migrationApplies(migration) {
  /** @type {number} */
  const currentVersion = game.settings.get('animabf', ABFSettingsKeys.SYSTEM_MIGRATION_VERSION);
  if (currentVersion < migration.version) {
    return true;
  }
  if (game.settings.get('animabf', ABFSettingsKeys.DEVELOP_MODE)) {
    console.warn(
      `AnimaBF | Migration ${migration.version} needs not to be applied, current system migration version is ${currentVersion}.`
    );
  }
  return false;
}

/**
 * @param {Migration} migration
 */
async function migrateAllActors(migration) {
  if (migration.updateActor) {
    // migrate world actors and unlinked token actors
    const unlinkedTokenActors = game.scenes.map(
      scene => scene.tokens.filter(token => !token.actorLink && token.actor).map(token => token.actor)
    ).flat();

    // add the actors in the compendia
    const actorPacks = await Promise.all(game.packs.filter(pack => pack.metadata.type === "Actor").map(
      async actorPack => {
        const packObj = { pack: actorPack, wasLocked: actorPack.locked };
        await actorPack.configure({ locked: false });
        return packObj;
      }
    ));
    const compendiaActors = (await Promise.all(actorPacks.map(packObject => {
      return packObject.pack.getDocuments();
    }))).flat();

    /** @type {ABFActor[]} */
    const actors = [...game.actors, ...unlinkedTokenActors, ...compendiaActors];

    for (const actor of actors) {
      console.log(`AnimaBF | Migrating actor ${actor.name} (${actor.id}).`);
      const updateData = (await migration.updateActor(actor)).toObject();
      await actor.update(updateData);
    }

    // Lock again packs which where locked
    actorPacks.filter(packObject => packObject.wasLocked).forEach(async packObject => {
      await packObject.pack.configure({ locked: true });
    });
  }
}

/**
 * @param {Migration} migration
 * @todo Implement this function
 */
function migrateItems(migration) {
  if (migration.preUpdateItem || migration.updateItem) {
    throw new Error(
      'AnimaBF | Trying to update items with a migration, but `migrateItems()` function in `migrate.js` not defined yet'
    );
  }
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
    console.log(`AnimaBF | Applying migration ${migration.version}.`);

    await migrateAllActors(migration);
    migrateItems(migration);
    migrateTokens(migration);

    console.log(`AnimaBF | Migration ${migration.version} completed.`);
    game.settings.set('animabf', ABFSettingsKeys.SYSTEM_MIGRATION_VERSION, migration.version);
    // TODO: add french translation for the warning dialog also.
    await ABFDialogs.prompt(
      game.i18n.format('dialogs.migrations.success', {
        version: migration.version,
        title: migration.title
      })
    );
    return true;
  } catch (err) {
    console.error(`AnimaBF | Error when trying to apply migration ${migration.version}:\n${err}`);
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
export function applyMigrations() {
  if (!game.user.isGM) { return; }

  const migrations = Object.values(MigrationList).filter(migration => migrationApplies(migration));

  migrations.forEach(migration => ABFDialogs.confirm(
    game.i18n.localize('dialogs.migrations.title'),
    `${game.i18n.localize('dialogs.migrations.content')}<br><hr><br>` +
    '<h4>Details of the migration (only English available):</h4>' +
    `<strong>Title:</strong> ${migration.title}<br>` +
    `<strong>Description:</strong> ${migration.description}`,
    {
      onConfirm: () => applyMigration(migration),
    }
  ));
}
