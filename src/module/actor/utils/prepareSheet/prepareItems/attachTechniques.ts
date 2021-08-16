import { ABFActor } from '../../../ABFActor';

export const attachTechniques = (
  originalSheet: ActorSheet.Data<ABFActor>,
  item: InnerDuplicated<Item.Data>
) => {
  const newSheet = JSON.parse(JSON.stringify(originalSheet)) as ActorSheet.Data<ABFActor>;

  const { data } = newSheet.actor;

  if (!data.domine.techniques) {
    data.domine.techniques = [];
  } else {
    data.domine.techniques.push(item);
  }

  return newSheet;
};
