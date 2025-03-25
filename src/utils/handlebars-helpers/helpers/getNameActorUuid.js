export const getNameActorUuid = {
  name: 'getNameActorUuid',
  fn: (actorUuid, thisActor) => {
    if (actorUuid) {
      if (actorUuid === thisActor?.uuid) {
        return '-';
      }
      const actorId = actorUuid.split('.')[1];
      const actor = game.actors.get(actorId);
      return actor.name;
    }
  }
};
