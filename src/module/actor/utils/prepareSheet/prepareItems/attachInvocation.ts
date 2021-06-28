import { ABFActor } from '../../../ABFActor';

export const attachInvocation = (
  originalSheet: ActorSheet.Data<ABFActor>,
  item: InnerDuplicated<Item.Data>
) => {
  const newSheet = JSON.parse(JSON.stringify(originalSheet)) as ActorSheet.Data<ABFActor>;

  const { data } = newSheet.actor;

  if (!data.mystic.invocation) {
    data.mystic.invocation = [];
  } else {
    data.mystic.invocation.push(item);
  }

  return newSheet;
};
