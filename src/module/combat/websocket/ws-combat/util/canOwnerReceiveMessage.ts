import { ABFActor } from '../../../../actor/ABFActor';

export const canOwnerReceiveMessage = (actor: ABFActor): boolean => {
  const tgame = game as Game;

  if (!actor.hasPlayerOwner || !actor.id) {
    return false;
  }

  const activePlayers = tgame.users!.players.filter(u => u.active);

  return activePlayers.filter(u => actor.testUserPermission(u, 'OWNER')).length === 1;
};
