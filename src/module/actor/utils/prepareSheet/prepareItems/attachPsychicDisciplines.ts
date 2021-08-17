import { ABFActor } from '../../../ABFActor';

export const attachPsychicDisciplines = (
  originalSheet: ActorSheet.Data<ABFActor>,
  item: InnerDuplicated<Item.Data>
) => {
  const newSheet = JSON.parse(JSON.stringify(originalSheet)) as ActorSheet.Data<ABFActor>;

  const { data } = newSheet.actor;

  if (!data.psychic.psychicDisciplines) {
    data.psychic.psychicDisciplines = [];
  } else {
    data.psychic.psychicDisciplines.push(item);
  }

  return newSheet;
};
