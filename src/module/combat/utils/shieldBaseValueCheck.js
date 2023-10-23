export const shieldBaseValueCheck = (potential, effectsList) => {
    const Effect = [20, 40, 80, 120, 140, 180, 240, 280, 320, 440];
    let index = Effect.findIndex(e => e == potential);

    let effect = effectsList[Effect[index]].value;

    effect = effect.replace('.','')
    if (/\d+ PV/i.test(effect)) { return [parseInt(effect.match(/\d+ PV/i)[0].match(/\d+/)[0], 10)?? 0]}
    else if (/Fatiga/.test(effect)) {
        index ++;
        effect = effectsList[Effect[index]].value;
        if (/\d+ PV/i.test(effect)) { return [parseInt(effect.match(/\d+ PV/i)[0].match(/\d+/)[0], 10)?? 0]}
        else if (/Fatiga/.test(effect)) {
            index ++;
            effect = effectsList[Effect[index]].value;
            if (/\d+ PV/i.test(effect)) { return [parseInt(effect.match(/\d+ PV/i)[0].match(/\d+/)[0], 10)?? 0]}
            else if (/Fatiga/.test(effect)) {
                index ++;
                effect = effectsList[Effect[index]].value;
                if (/\d+ PV/i.test(effect)) { return [parseInt(effect.match(/\d+ PV/i)[0].match(/\d+/)[0], 10)?? 0]}
                else if (/Fatiga/.test(effect)) {
                    index ++;
                    effect = effectsList[Effect[index]].value;
                    if (/\d+ PV/i.test(effect)) { return [parseInt(effect.match(/\d+ PV/i)[0].match(/\d+/)[0], 10)?? 0]}
                }
            }
        }
    } else { return [0]}
};