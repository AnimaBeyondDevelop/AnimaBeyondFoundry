import { ABFActor } from '../../../ABFActor';

export const attachSummon = (
  originalSheet: ActorSheet.Data<ABFActor>,
  item: InnerDuplicated<Item.Data>
) => {
  const newSheet = JSON.parse(JSON.stringify(originalSheet)) as ActorSheet.Data<ABFActor>;

  const { data } = newSheet.actor;

  if (!data.mystic.summons) {
    data.mystic.summons = [];
  } else {
    data.mystic.summons.push(item);
  }

  return newSheet;
};
