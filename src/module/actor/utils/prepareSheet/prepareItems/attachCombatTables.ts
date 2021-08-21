import { ABFActor } from '../../../ABFActor';

export const attachCombatTables = (
  originalSheet: ActorSheet.Data<ABFActor>,
  item: InnerDuplicated<Item.Data>
) => {
  const newSheet = JSON.parse(JSON.stringify(originalSheet)) as ActorSheet.Data<ABFActor>;

  const { data } = newSheet.actor;

  if (!data.combat.combatTables) {
    data.combat.combatTables = [];
  } else {
    data.combat.combatTables.push(item);
  }

  return newSheet;
};