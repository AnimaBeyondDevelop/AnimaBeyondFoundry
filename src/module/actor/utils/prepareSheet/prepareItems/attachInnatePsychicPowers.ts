import { ABFActor } from '../../../ABFActor';

export const attachInnatePsychicPowers = (
  originalSheet: ActorSheet.Data<ABFActor>,
  item: InnerDuplicated<Item.Data>
) => {
  const newSheet = JSON.parse(JSON.stringify(originalSheet)) as ActorSheet.Data<ABFActor>;

  const { data } = newSheet.actor;

  if (!data.psychic.innatePsychicPowers) {
    data.psychic.innatePsychicPowers = [];
  } else {
    data.psychic.innatePsychicPowers.push(item);
  }

  return newSheet;
};
