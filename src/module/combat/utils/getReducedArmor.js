export const getReducedArmor = (actor, weapon) => {
    const reducedArmor = { ignoreArmor: false, value: 0 };

    const weaponReducedArmor = weapon == undefined ? 0 : (weapon.system.quality.value / 5) + weapon.system.extraReducedArmor.value;
    const actorReducedArmor = actor.system.combat.extraReducedArmor.value;

    const weaponIgnoreArmor = weapon == undefined ? false : weapon.system.ignoreArmor.value;
    const actorIgnoreArmor = actor.system.combat.ignoreArmor.value;

    reducedArmor.value = weaponReducedArmor + actorReducedArmor;
    reducedArmor.ignoreArmor = weaponIgnoreArmor || actorIgnoreArmor;

    return reducedArmor;
};