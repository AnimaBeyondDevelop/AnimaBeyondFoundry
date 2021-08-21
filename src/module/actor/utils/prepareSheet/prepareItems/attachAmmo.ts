import { ABFActor } from '../../../ABFActor';

export const attachAmmo = (
  originalSheet: ActorSheet.Data<ABFActor>,
  item: InnerDuplicated<Item.Data>
) => {
  const newSheet = JSON.parse(JSON.stringify(originalSheet)) as ActorSheet.Data<ABFActor>;

  const { data } = newSheet.actor;

  if (!data.combat.ammo) {
    data.combat.ammo = [];
  } else {
    data.combat.ammo.push(item);
  }

  return newSheet;
};