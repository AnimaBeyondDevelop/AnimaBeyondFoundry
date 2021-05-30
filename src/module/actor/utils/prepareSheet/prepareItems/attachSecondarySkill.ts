import { ABFActor } from '../../../ABFActor';

export const attachSecondarySkill = (
  originalSheet: ActorSheet.Data<ABFActor>,
  item: InnerDuplicated<Item.Data>
) => {
  const newSheet = JSON.parse(JSON.stringify(originalSheet)) as ActorSheet.Data<ABFActor>;

  if (!newSheet.actor.data.skill) {
    newSheet.actor.data.skill = [];
  }

  newSheet.actor.data.skill.push(item);

  return newSheet;
};
