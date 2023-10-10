export const shieldValueCheck = (effect) => {
    effect = effect.replace('.','')
    if (/\d+ puntos de resistencia/i.test(effect)) { return [parseInt(effect.match(/\d+ puntos de resistencia/i)[0].match(/\d+/)[0], 10)?? 0]}
    else if (/\d+ PV/i.test(effect)) { return [parseInt(effect.match(/\d+ PV/i)[0].match(/\d+/)[0], 10)?? 0]}
    else { return [0]}
    };