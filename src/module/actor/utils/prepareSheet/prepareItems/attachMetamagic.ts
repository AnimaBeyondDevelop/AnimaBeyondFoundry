import { ABFActor } from '../../../ABFActor';

export const attachMetamagic = (
  originalSheet: ActorSheet.Data<ABFActor>,
  item: InnerDuplicated<Item.Data>
) => {
  const newSheet = JSON.parse(JSON.stringify(originalSheet)) as ActorSheet.Data<ABFActor>;

  const { data } = newSheet.actor;

  if (!data.mystic.metamagic) {
    data.mystic.metamagic = [];
  } else {
    data.mystic.metamagic.push(item);
  }

  return newSheet;
};
