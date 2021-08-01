import { ABFActor } from '../../../ABFActor';

export const attachElan = (
  originalSheet: ActorSheet.Data<ABFActor>,
  item: InnerDuplicated<Item.Data>
) => {
  const newSheet = JSON.parse(JSON.stringify(originalSheet)) as ActorSheet.Data<ABFActor>;

  const { data } = newSheet.actor;

  if (!data.general.elan) {
    data.general.elan = [];
  } else {
    data.general.elan.push(item);
  }

  return newSheet;
};
