import { ABFActor } from './module/actor/ABFActor';
import { ABFActorDataSourceData } from './module/types/Actor';
import { AdvantageDataSource } from './module/types/general/AdvantageItemConfig';
import { DisadvantageDataSource } from './module/types/general/DisadvantageItemConfig';
import { FreeAccessSpellDataSource } from './module/types/mystic/FreeAccessSpellItemConfig';
import { MentalPatternDataSource } from './module/types/psychic/MentalPatternItemConfig';
import { NoteDataSource } from './module/types/general/NoteItemConfig';
import { PsychicDisciplineDataSource } from './module/types/psychic/PsychicDisciplineItemConfig';
import { PsychicPowerDataSource } from './module/types/psychic/PsychicPowerItemConfig';
import { TechniqueDataSource } from './module/types/domine/TechniqueItemConfig';
import { WeaponDataSource } from './module/types/combat/WeaponItemConfig';
import { ArmorDataSource } from './module/types/combat/ArmorItemConfig';
import ABFItem from './module/items/ABFItem';

export type ABFItemBaseDataSource<T, D> = {
  _id: string;
  type: T;
  name: string;
  data: D;
};

export type ABFItemsDataSource =
  | AdvantageDataSource
  | ArmorDataSource
  | DisadvantageDataSource
  | FreeAccessSpellDataSource
  | MentalPatternDataSource
  | NoteDataSource
  | PsychicDisciplineDataSource
  | PsychicPowerDataSource
  | TechniqueDataSource
  | WeaponDataSource;

interface ABFActorDataSource {
  type: 'character';
  data: ABFActorDataSourceData;
}

type ABFActorsDataSource = ABFActorDataSource;

declare global {
  interface SourceConfig {
    Actor: ABFActorsDataSource;
    Item: ABFItemsDataSource;
  }

  interface DataConfig {
    Actor: ABFActorsDataSource;
    Item: ABFItemsDataSource;
  }

  interface DocumentClassConfig {
    Actor: typeof ABFActor;
    Item: typeof ABFItem;
  }
}
