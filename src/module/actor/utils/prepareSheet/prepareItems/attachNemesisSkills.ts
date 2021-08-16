import { ABFActor } from '../../../ABFActor';

export const attachNemesisSkills = (
  originalSheet: ActorSheet.Data<ABFActor>,
  item: InnerDuplicated<Item.Data>
) => {
  const newSheet = JSON.parse(JSON.stringify(originalSheet)) as ActorSheet.Data<ABFActor>;

  const { data } = newSheet.actor;

  if (!data.domine.nemesisSkills) {
    data.domine.nemesisSkills = [];
  } else {
    data.domine.nemesisSkills.push(item);
  }

  return newSheet;
};
