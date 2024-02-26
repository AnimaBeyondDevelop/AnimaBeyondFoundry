/** @typedef {import('./Migration').Migration} Migration

/** @type Migration */
export const Migration2MagicProjection = {
  version: 2,
  title: 'proyeccion',
  description: `proyeccion`,
  updateActor(actor) {
    // si el desequilibrio es 0, ponemos la proyeccion normal a ambos
    if (actor.system.mystic.magicProjection.imbalance.offensive.base.value === 0 ) {
      actor.system.mystic.magicProjection.imbalance.offensive.base.value = actor.system.mystic.magicProjection.base.value;
    }

    if(actor.system.mystic.magicProjection.imbalance.defensive.base.value === 0){
      actor.system.mystic.magicProjection.imbalance.defensive.base.value = actor.system.mystic.magicProjection.base.value;
    }
    // si el desequilibrio no es 0, ponemos la proyeccion desbalanceada a ambos

    return actor;
  }
};
