import { ABFActor } from '../../../ABFActor';

export const attachNotes = (
  originalSheet: ActorSheet.Data<ABFActor>,
  item: InnerDuplicated<Item.Data>
) => {
  const newSheet = JSON.parse(JSON.stringify(originalSheet)) as ActorSheet.Data<ABFActor>;

  const { data } = newSheet.actor;

  if (!data.general.notes) {
    data.general.notes = [];
  } else {
    data.general.notes.push(item);
  }

  return newSheet;
};
