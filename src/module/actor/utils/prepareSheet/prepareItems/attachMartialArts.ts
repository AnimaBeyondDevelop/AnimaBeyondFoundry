import { ABFActor } from '../../../ABFActor';

export const attachMartialArts = (
  originalSheet: ActorSheet.Data<ABFActor>,
  item: InnerDuplicated<Item.Data>
) => {
  const newSheet = JSON.parse(JSON.stringify(originalSheet)) as ActorSheet.Data<ABFActor>;

  const { data } = newSheet.actor;

  if (!data.domine.martialArts) {
    data.domine.martialArts = [];
  } else {
    data.domine.martialArts.push(item);
  }

  return newSheet;
};
