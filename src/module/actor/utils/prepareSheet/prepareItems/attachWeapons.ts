import { ABFActor } from '../../../ABFActor';

export const attachWeapons = (
  originalSheet: ActorSheet.Data<ABFActor>,
  item: InnerDuplicated<Item.Data>
) => {
  const newSheet = JSON.parse(JSON.stringify(originalSheet)) as ActorSheet.Data<ABFActor>;

  const { data } = newSheet.actor;

  if (!data.combat.weapons) {
    data.combat.weapons = [];
  } else {
    data.combat.weapons.push(item);
  }

  return newSheet;
};