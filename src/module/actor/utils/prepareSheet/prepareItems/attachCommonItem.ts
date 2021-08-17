import { ABFActor } from '../../../ABFActor';

export const attachCommonItem = (
  originalSheet: ActorSheet.Data<ABFActor>,
  item: InnerDuplicated<Item.Data>
) => {
  const newSheet = JSON.parse(JSON.stringify(originalSheet)) as ActorSheet.Data<ABFActor>;

  if (!newSheet.actor.data[item.type]) {
    newSheet.actor.data[item.type] = [];
  }

  newSheet.actor.data[item.type].push(item);

  return newSheet;
};
