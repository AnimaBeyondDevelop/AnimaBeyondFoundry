import { ABFActor } from '../../../ABFActor';

export const attachPsychicPowers = (
  originalSheet: ActorSheet.Data<ABFActor>,
  item: InnerDuplicated<Item.Data>
) => {
  const newSheet = JSON.parse(JSON.stringify(originalSheet)) as ActorSheet.Data<ABFActor>;

  const { data } = newSheet.actor;

  if (!data.psychic.psychicPowers) {
    data.psychic.psychicPowers = [];
  } else {
    data.psychic.psychicPowers.push(item);
  }

  return newSheet;
};
