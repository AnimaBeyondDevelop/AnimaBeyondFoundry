import { ABFItemBaseDataSource } from '../../../animabf.types';
import { TokenData } from '../../../types/foundry-vtt-types/src/foundry/common/data/module.mjs';
import { ABFActor } from '../../actor/ABFActor';
import ABFItem from '../../items/ABFItem';
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
   * This is the migration id.
   */
  readonly id: string;

  /**
   * Minimum required system version for this migration before the migration is applied.
   */
  readonly version: string;

  /**
   * The value used to sort migrations within the same version.
   */
  readonly order: number;

  /**
   * This is a short title describing the purpose of the migration.
   * The title is displayed on the warning dialog before applying the migration.
   */
  readonly title: string;

  /**
   * This is a longer description of the changes in the migration, supposed to be detailed but concise.
   * To be displayed on the warning dialog before applying the migration.
   */
  readonly description: string;

  /**
   * Update the actor to the latest schema version.
   * @param actor - The actor to migrate
   * @returns The actor after the changes in the migration.
   */
  updateActor?(actor: ABFActor): ABFActor | Promise<ABFActor>;

  /**
   * Update the item to the latest schema version.
   * @param item - Item to update.
   * @returns The item after the changes in the migration
   */
  updateItem?(item: ABFItem): ABFItem | Promise<ABFItem>;

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

  /**
   * Filter determining which items should be migrated. The filter is used inside Array.filter(...)
   */
  filterItems?(item: ABFItem): boolean;

  /**
   * Filter determining which actors should be migrated. The filter is used inside Array.filter(...)
   */
  filterActors?(actor: ABFActor): boolean;
}
