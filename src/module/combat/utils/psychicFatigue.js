export const psychicFatigue = (effect, fatigueInmune) => {
    if (/Fatiga/.test(effect)) {return [true, fatigueInmune? 0 : parseInt(effect.match(/\d+/)[0], 10)?? 0]}
    else {return [false, 0]}
    };