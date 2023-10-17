import { ABFItemBaseDataSource } from '../../../animabf.types';
import { TokenData } from '../../../types/foundry-vtt-types/src/foundry/common/data/module.mjs';
import { ABFActor } from '../../actor/ABFActor';
import { ABFActorDataSourceData } from '../../types/Actor';

/**
 * This is the base class for a migration, coppied and modified from pf2e system.
 * If you make a change to the database schema (i.e. anything in template.json),
 * you probably should create a migration. To do so, there are several steps:
 * - Make a class that inherits this base class and implements `updateActor` or `updateItem` using a
 *   new value for the version
 * - Add this class to getAllMigrations() in src/module/migrations/index.js
 * - Test that your changes work.
 */
export interface Migration {
  /**
   * This is the migration version.
   */
  readonly version: number;

  /**
   * This is a short title describing the purpose of the migration.
   * The title is displayed on the warning dialog before applying the migration.
   */
  readonly title: string,

  /**
   * This is a longer description of the changes in the migration, supposed to be detailed but concise.
   * To be displayed on the warning dialog before applying the migration.
   */
  readonly description: string,

  /**
   * Update the actor to the latest schema version.
   * @param data - This should be effectively a `ABFActorDataSourceData` from the previous version.
   * @returns The updated version of `data`.
   */
  updateActor?(data: ABFActorDataSourceData): ABFActorDataSourceData;

  /**
   * Update the item to the latest schema version, handling changes that must happen before any other migration in a
   * given list.
   * @param data - Item to update. This should be an `ItemData` from the previous version
   * @param actorData - If the item is part of an actor, this is set to the actor data
   * @returns The updated version of `data`.
   */
  preUpdateItem?(
    data: ABFItemBaseDataSource,
    actorData?: ABFActorDataSourceData
  ): ABFItemBaseDataSource;

  /**
   * Update the item to the latest schema version.
   * @param data Item to update. This should be an `ItemData` from the previous version.
   * @param actorData If the item is part of an actor, this is set to the actor. For instance
   * @returns The updated version of `data`.
   */
  updateItem?(
    data: ABFItemBaseDataSource,
    actorData?: ABFActorDataSourceData
  ): ABFItemBaseDataSource;

  /**
   * Update the token to the latest schema version.
   * @param tokenData Token data to update. This should be a `TokenData` from the previous version.
   * @returns The updated version of `TokenData`.
   */
  updateToken?(
    tokenData: TokenData,
    actor: Readonly<ABFActor | null>,
    scene: Readonly<Scene | null>
  ): TokenData;

  /**
   * Run migrations for this schema version.
   * Sometimes there needs to be custom steps run during a migration. For instance, if the change
   * isn't actor or item related. This function will be called during the migration.
   */
  migrate?(): void;
}
