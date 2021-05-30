import { ABFActor } from '../../../ABFActor';

export const attachFreeAccessSpell = (
  originalSheet: ActorSheet.Data<ABFActor>,
  item: InnerDuplicated<Item.Data>
) => {
  const newSheet = JSON.parse(JSON.stringify(originalSheet)) as ActorSheet.Data<ABFActor>;

  const { data } = newSheet.actor;

  if (!data.mystic.freeAccessSpells) {
    data.mystic.freeAccessSpells = [];
  } else {
    data.mystic.freeAccessSpells.push(item);
  }

  return newSheet;
};
