import { ABFActor } from '../../../ABFActor';

export const attachArsMagnus = (
  originalSheet: ActorSheet.Data<ABFActor>,
  item: InnerDuplicated<Item.Data>
) => {
  const newSheet = JSON.parse(JSON.stringify(originalSheet)) as ActorSheet.Data<ABFActor>;

  const { data } = newSheet.actor;

  if (!data.domine.arsMagnus) {
    data.domine.arsMagnus = [];
  } else {
    data.domine.arsMagnus.push(item);
  }

  return newSheet;
};
