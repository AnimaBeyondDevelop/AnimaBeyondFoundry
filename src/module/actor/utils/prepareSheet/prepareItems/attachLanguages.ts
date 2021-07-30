import { ABFActor } from '../../../ABFActor';

export const attachLanguages = (
  originalSheet: ActorSheet.Data<ABFActor>,
  item: InnerDuplicated<Item.Data>
) => {
  const newSheet = JSON.parse(JSON.stringify(originalSheet)) as ActorSheet.Data<ABFActor>;

  const { data } = newSheet.actor;

  if (!data.general.languages.others) {
    data.general.languages.others = [];
  } else {
    data.general.languages.others.push(item);
  }

  return newSheet;
};
