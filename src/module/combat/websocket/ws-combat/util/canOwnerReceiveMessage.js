import { ABFActor } from '../../../../actor/ABFActor';

/**
 * @param {ABFActor} actor
 * @returns
 */
export const canOwnerReceiveMessage = actor => {
  if (!actor.hasPlayerOwner || !actor.id) {
    return false;
  }

  const activePlayers = game.users.players.filter(u => u.active);

  return activePlayers.filter(u => actor.testUserPermission(u, 'OWNER')).length === 1;
};
