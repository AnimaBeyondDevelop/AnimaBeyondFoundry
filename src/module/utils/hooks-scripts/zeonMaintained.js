export const zeonMaintained = () => {
    const combatants = game.combat.combatants.map(c => c.token).filter(i => i.actor.system.mystic.zeonMaintained.value > 0)
    if (combatants.length == 0) {return}
    else {
      for (let combantant of combatants) {
      let Zeon = combantant.actor.system.mystic.zeon.value;
      let Mnt = combantant.actor.system.mystic.zeonMaintained.value;
      let updateZeon = Zeon - Mnt;
      combantant.actor.update({ "system.mystic.zeon.value": updateZeon })
      }
    }
  }