import { ABFActor } from '../../../ABFActor';

export const attachSelectedSpells = (
  originalSheet: ActorSheet.Data<ABFActor>,
  item: InnerDuplicated<Item.Data>
) => {
  const newSheet = JSON.parse(JSON.stringify(originalSheet)) as ActorSheet.Data<ABFActor>;

  const { data } = newSheet.actor;

  if (!data.mystic.selected) {
    data.mystic.selected = [];
  } else {
    data.mystic.selected.push(item);
  }

  return newSheet;
};
