import { ABFActor } from './module/actor/ABFActor';
import { ABFActorDataSourceData } from './module/types/Actor';
import { AdvantageDataSource } from './module/types/general/AdvantageItemConfig';
import { DisadvantageDataSource } from './module/types/general/DisadvantageItemConfig';
import { SpellDataSource } from './module/types/mystic/SpellItemConfig';
import { MentalPatternDataSource } from './module/types/psychic/MentalPatternItemConfig';
import { NoteDataSource } from './module/types/general/NoteItemConfig';
import { PsychicDisciplineDataSource } from './module/types/psychic/PsychicDisciplineItemConfig';
import { PsychicPowerDataSource } from './module/types/psychic/PsychicPowerItemConfig';
import { TechniqueDataSource } from './module/types/domine/TechniqueItemConfig';
import { WeaponDataSource } from './module/types/combat/WeaponItemConfig';
import { ArmorDataSource } from './module/types/combat/ArmorItemConfig';
import ABFItem from './module/items/ABFItem';
import { ABFConfig } from './module/ABFConfig';
import { AmmoDataSource } from './module/types/combat/AmmoItemConfig';
import ABFFoundryRoll from './module/rolls/ABFFoundryRoll';
import { WSUserCombatManager } from './module/combat/websocket/ws-combat/user/WSUserCombatManager';
import { WSGMCombatManager } from './module/combat/websocket/ws-combat/gm/WSGMCombatManager';

export type ABFItemBaseDataSource<T, D> = {
  _id: string;
  type: T;
  name: string;
  data: D;
};

export type ABFItemsDataSource =
  | AmmoDataSource
  | AdvantageDataSource
  | ArmorDataSource
  | DisadvantageDataSource
  | SpellDataSource
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
  interface Window {
    ABFFoundryRoll: typeof ABFFoundryRoll;

    Websocket: {
      sendAttack?: typeof WSGMCombatManager.prototype.sendAttack;
      sendAttackRequest?: typeof WSUserCombatManager.prototype.sendAttackRequest;
    };
  }

  interface CONFIG {
    config: typeof ABFConfig;
  }

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
    Roll: typeof ABFFoundryRoll;
  }
}
