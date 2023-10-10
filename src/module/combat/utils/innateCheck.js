export const innateCheck = (act, advantages, cost) => {
    const zeonInnateTable = [10, 20, 30, 40, 50, 60, 70, 80, 90];
    let maxZeon = 0;
    if (act < 55) {maxZeon = zeonInnateTable[0]}
    else if(act < 75) {maxZeon = zeonInnateTable[1]}
    else if(act < 95) {maxZeon = zeonInnateTable[2]} 
    else if(act < 115) {maxZeon = zeonInnateTable[3]} 
    else if(act < 135) {maxZeon = zeonInnateTable[4]} 
    else if(act < 155) {maxZeon = zeonInnateTable[5]} 
    else if(act < 185) {maxZeon = zeonInnateTable[6]} 
    else if(act <= 200) {maxZeon = zeonInnateTable[7]} 
    else {maxZeon = zeonInnateTable[8]}
    if (advantages.lenght !== 0) {
        const regExp = new RegExp('Magia innata mejorada[^\d]+\d', 'i');
        let innateAdvantage = regExp.exec(advantages.map(i => i.name))
        if (innateAdvantage !== null){
            maxZeon += parseInt(innateAdvantage[0].match(/\d/)[0], 10) * 10 ?? 0
        }
    }
    if (maxZeon >= cost) {return true}
    else return false;
};