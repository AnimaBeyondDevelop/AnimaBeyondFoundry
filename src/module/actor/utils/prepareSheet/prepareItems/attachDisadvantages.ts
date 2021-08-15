import { ABFActor } from '../../../ABFActor';

export const attachDisadvantages = (
  originalSheet: ActorSheet.Data<ABFActor>,
  item: InnerDuplicated<Item.Data>
) => {
  const newSheet = JSON.parse(JSON.stringify(originalSheet)) as ActorSheet.Data<ABFActor>;

  const { data } = newSheet.actor;

  if (!data.general.disadvantages) {
    data.general.disadvantages = [];
  } else {
    data.general.disadvantages.push(item);
  }

  return newSheet;
};
