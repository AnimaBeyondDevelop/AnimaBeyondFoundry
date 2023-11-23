import { ArmorLocation } from '../../types/combat/ArmorItemConfig';

export const getFinalArmor = (actor, at, reducedArmor) => {
    const equippedArmors = (actor.system.combat.armors).filter(
        armor => armor.system.equipped.value && armor.system.localization.value !== ArmorLocation.HEAD
    );

    const isInmodifiable = equippedArmors.find(i => i.system.isInmodifiable.value == true) != undefined || actor.system.combat.inmodifiableArmor.value;
    let finalAt = 0;
    if (isInmodifiable && reducedArmor.ignoreArmor) {
        finalAt = Math.ceil(at / 2);
    }
    else if (isInmodifiable) {
        finalAt = at;
    }
    else if (reducedArmor.ignoreArmor) {
        finalAt = 0;
    }
    else {
        finalAt = at - reducedArmor.value;
    }

    return Math.clamped(finalAt, 0, 10);
}
