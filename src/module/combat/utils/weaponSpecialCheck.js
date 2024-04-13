export const weaponSpecialCheck = (weapon) => {
    const specialEffect = weapon?.system.special.value;
    if (/Presa/.test(specialEffect)) {
        if (/Fuerza/.test(specialEffect)) {
            return parseInt(specialEffect.match(/Presa \(Fuerza \d+\)/)[0].match(/\d+/)[0], 10) ?? 0
        }
        if (/FUE/.test(specialEffect)) {
            return parseInt(specialEffect.match(/Presa \(FUE \d+\)/)[0].match(/\d+/)[0], 10) ?? 0
        }
    }
    else { return }
};