import { ABFActor } from '../../../ABFActor';

export const attachContacts = (
  originalSheet: ActorSheet.Data<ABFActor>,
  item: InnerDuplicated<Item.Data>
) => {
  const newSheet = JSON.parse(JSON.stringify(originalSheet)) as ActorSheet.Data<ABFActor>;

  const { data } = newSheet.actor;

  if (!data.general.contacts) {
    data.general.contacts = [];
  } else {
    data.general.contacts.push(item);
  }

  return newSheet;
};
