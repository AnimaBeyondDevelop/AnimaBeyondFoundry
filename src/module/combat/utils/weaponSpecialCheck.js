export const weaponSpecialCheck = (weapon) => {
    const specialEffect = weapon?.system.special.value;
    if (/Presa/.test(specialEffect)) { return parseInt(specialEffect.match(/Presa \(Fuerza \d+\)/)[0].match(/\d+/)[0], 10)?? 0}
    else { return }
};