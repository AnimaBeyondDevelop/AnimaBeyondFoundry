import { ABFActorDataSourceData } from './module/actor/ABFActor.type';
import { ABFActor } from './module/actor/ABFActor';

interface ABFActorDataSource {
  type: 'character';
  data: ABFActorDataSourceData;
}

type ABFActorsDataSource = ABFActorDataSource;

declare global {
  interface SourceConfig {
    Actor: ABFActorsDataSource;
  }

  interface DataConfig {
    Actor: ABFActorsDataSource;
  }

  interface DocumentClassConfig {
    Actor: typeof ABFActor;
  }
}
