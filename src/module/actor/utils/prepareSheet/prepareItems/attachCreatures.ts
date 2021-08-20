import { ABFActor } from '../../../ABFActor';

export const attachCreatures = (
  originalSheet: ActorSheet.Data<ABFActor>,
  item: InnerDuplicated<Item.Data>
) => {
  const newSheet = JSON.parse(JSON.stringify(originalSheet)) as ActorSheet.Data<ABFActor>;

  const { data } = newSheet.actor;

  if (!data.domine.creatures) {
    data.domine.creatures = [];
  } else {
    data.domine.creatures.push(item);
  }

  return newSheet;
};
