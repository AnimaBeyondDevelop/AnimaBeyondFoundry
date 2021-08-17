import { ABFActor } from '../../../ABFActor';

export const attachMetamagics = (
  originalSheet: ActorSheet.Data<ABFActor>,
  item: InnerDuplicated<Item.Data>
) => {
  const newSheet = JSON.parse(JSON.stringify(originalSheet)) as ActorSheet.Data<ABFActor>;

  const { data } = newSheet.actor;

  if (!data.mystic.metamagics) {
    data.mystic.metamagics = [];
  } else {
    data.mystic.metamagics.push(item);
  }

  return newSheet;
};
