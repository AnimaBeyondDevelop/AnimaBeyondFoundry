import { ABFActor } from '../../../ABFActor';

export const attachSelectedSpells = (
  originalSheet: ActorSheet.Data<ABFActor>,
  item: InnerDuplicated<Item.Data>
) => {
  const newSheet = JSON.parse(JSON.stringify(originalSheet)) as ActorSheet.Data<ABFActor>;

  const { data } = newSheet.actor;

  if (!data.mystic.selectedSpells) {
    data.mystic.selectedSpells = [];
  } else {
    data.mystic.selectedSpells.push(item);
  }

  return newSheet;
};
