import { ABFActor } from '../../../ABFActor';

export const attachAdvantages = (
  originalSheet: ActorSheet.Data<ABFActor>,
  item: InnerDuplicated<Item.Data>
) => {
  const newSheet = JSON.parse(JSON.stringify(originalSheet)) as ActorSheet.Data<ABFActor>;

  const { data } = newSheet.actor;

  if (!data.general.advantages) {
    data.general.advantages = [];
  } else {
    data.general.advantages.push(item);
  }

  return newSheet;
};
