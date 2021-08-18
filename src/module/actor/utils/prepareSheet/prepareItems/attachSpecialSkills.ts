import { ABFActor } from '../../../ABFActor';

export const attachSpecialSkills = (
  originalSheet: ActorSheet.Data<ABFActor>,
  item: InnerDuplicated<Item.Data>
) => {
  const newSheet = JSON.parse(JSON.stringify(originalSheet)) as ActorSheet.Data<ABFActor>;

  const { data } = newSheet.actor;

  if (!data.domine.specialSkills) {
    data.domine.specialSkills = [];
  } else {
    data.domine.specialSkills.push(item);
  }

  return newSheet;
};
