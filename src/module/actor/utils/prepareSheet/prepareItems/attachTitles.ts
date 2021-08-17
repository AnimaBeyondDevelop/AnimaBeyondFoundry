import { ABFActor } from '../../../ABFActor';

export const attachTitles = (
  originalSheet: ActorSheet.Data<ABFActor>,
  item: InnerDuplicated<Item.Data>
) => {
  const newSheet = JSON.parse(JSON.stringify(originalSheet)) as ActorSheet.Data<ABFActor>;

  const { data } = newSheet.actor;

  if (!data.general.titles) {
    data.general.titles = [];
  } else {
    data.general.titles.push(item);
  }

  return newSheet;
};
