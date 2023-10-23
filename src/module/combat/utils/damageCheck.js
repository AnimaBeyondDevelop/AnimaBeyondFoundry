export const damageCheck = (effect) => {
    if (/Daño[^\d]*\d+/i.test(effect)) {return [parseInt(effect.match(/Daño[^\d]*\d+/i)[0].match(/\d+/)[0], 10) ?? 0]}
    else {return [0]}
    };