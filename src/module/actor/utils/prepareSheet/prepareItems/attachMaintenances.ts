import { ABFActor } from '../../../ABFActor';

export const attachMaintenances = (
  originalSheet: ActorSheet.Data<ABFActor>,
  item: InnerDuplicated<Item.Data>
) => {
  const newSheet = JSON.parse(JSON.stringify(originalSheet)) as ActorSheet.Data<ABFActor>;

  const { data } = newSheet.actor;

  if (!data.mystic.maintenances) {
    data.mystic.maintenances = [];
  } else {
    data.mystic.maintenances.push(item);
  }

  return newSheet;
};
