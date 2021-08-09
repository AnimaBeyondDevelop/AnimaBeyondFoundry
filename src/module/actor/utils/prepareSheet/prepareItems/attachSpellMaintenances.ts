import { ABFActor } from '../../../ABFActor';

export const attachSpellMaintenances = (
  originalSheet: ActorSheet.Data<ABFActor>,
  item: InnerDuplicated<Item.Data>
) => {
  const newSheet = JSON.parse(JSON.stringify(originalSheet)) as ActorSheet.Data<ABFActor>;

  const { data } = newSheet.actor;

  if (!data.mystic.spellMaintenances) {
    data.mystic.spellMaintenances = [];
  } else {
    data.mystic.spellMaintenances.push(item);
  }

  return newSheet;
};
