import { ABFActor } from '../../../ABFActor';

export const attachCombatSpecialSkills = (
  originalSheet: ActorSheet.Data<ABFActor>,
  item: InnerDuplicated<Item.Data>
) => {
  const newSheet = JSON.parse(JSON.stringify(originalSheet)) as ActorSheet.Data<ABFActor>;

  const { data } = newSheet.actor;

  if (!data.combat.combatSpecialSkills) {
    data.combat.combatSpecialSkills = [];
  } else {
    data.combat.combatSpecialSkills.push(item);
  }

  return newSheet;
};
