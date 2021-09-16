import { ABFActor } from '../../../../actor/ABFActor';

export const canOwnerReceiveMessage = (actor: ABFActor): boolean => {
  const tgame = game as Game;

  if (!actor.hasPlayerOwner || !actor.id) {
    return false;
  }

  const user = tgame.users?.filter(e => !!e.character).find(e => e.character?.id === actor.id);

  return !!user?.active;
};
