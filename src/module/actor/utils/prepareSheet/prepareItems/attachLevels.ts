import { ABFActor } from '../../../ABFActor';

export const attachLevels = (
  originalSheet: ActorSheet.Data<ABFActor>,
  item: InnerDuplicated<Item.Data>
) => {
  const newSheet = JSON.parse(JSON.stringify(originalSheet)) as ActorSheet.Data<ABFActor>;

  const { data } = newSheet.actor;

  if (!data.general.levels) {
    data.general.levels = [];
  } else {
    data.general.levels.push(item);
  }

  return newSheet;
};
