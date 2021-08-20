import { ABFActor } from '../../../ABFActor';

export const attachKiSkills = (
  originalSheet: ActorSheet.Data<ABFActor>,
  item: InnerDuplicated<Item.Data>
) => {
  const newSheet = JSON.parse(JSON.stringify(originalSheet)) as ActorSheet.Data<ABFActor>;

  const { data } = newSheet.actor;

  if (!data.domine.kiSkills) {
    data.domine.kiSkills = [];
  } else {
    data.domine.kiSkills.push(item);
  }

  return newSheet;
};
