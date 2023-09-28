export const resistanceCheck = (effect) => {
    if (/\d+ RF/.test(effect)) { return [true, "physical", parseInt(effect.match(/\d+ RF/)[0].match(/\d+/)[0], 10)?? 0]}
    else if (/\d+ RE/.test(effect)) { return [true, "disease", parseInt(effect.match(/\d+ RE/)[0].match(/\d+/)[0], 10)?? 0]}
    else if (/\d+ RV/.test(effect)) { return [true, "poison", parseInt(effect.match(/\d+ RV/)[0].match(/\d+/)[0], 10)?? 0]}
    else if (/\d+ RM/.test(effect)) { return [true, "magic", parseInt(effect.match(/\d+ RM/)[0].match(/\d+/)[0], 10)?? 0]}
    else if (/\d+ RP/.test(effect)) { return [true, "psychic", parseInt(effect.match(/\d+ RP/)[0].match(/\d+/)[0], 10)?? 0]}
    else if (/RF \d+/.test(effect)) { return [true, "physical", parseInt(effect.match(/RF \d+/)[0].match(/\d+/)[0], 10)?? 0]}
    else if (/RE \d+/.test(effect)) { return [true, "disease", parseInt(effect.match(/RE \d+/)[0].match(/\d+/)[0], 10)?? 0]}
    else if (/RV \d+/.test(effect)) { return [true, "poison", parseInt(effect.match(/RV \d+/)[0].match(/\d+/)[0], 10)?? 0]}
    else if (/RM \d+/.test(effect)) { return [true, "magic", parseInt(effect.match(/RM \d+/)[0].match(/\d+/)[0], 10)?? 0]}
    else if (/RP \d+/.test(effect)) { return [true, "psychic", parseInt(effect.match(/RP \d+/)[0].match(/\d+/)[0], 10)?? 0]}
    else { return [false, "", 0]}
};