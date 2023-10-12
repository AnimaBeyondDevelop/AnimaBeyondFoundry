export const calculateInnateMagic = (act) => {
    const zeonInnateTable = [10, 20, 30, 40, 50, 60, 70, 80, 90];
    let innateMagic = 0;
    if (act < 10) {innateMagic = 0}
    else if (act < 55) {innateMagic = zeonInnateTable[0]}
    else if (act < 75) {innateMagic = zeonInnateTable[1]}
    else if (act < 95) {innateMagic = zeonInnateTable[2]} 
    else if (act < 115) {innateMagic = zeonInnateTable[3]} 
    else if (act < 135) {innateMagic = zeonInnateTable[4]} 
    else if (act < 155) {innateMagic = zeonInnateTable[5]} 
    else if (act < 185) {innateMagic = zeonInnateTable[6]} 
    else if (act <= 200) {innateMagic = zeonInnateTable[7]} 
    else {innateMagic = zeonInnateTable[8]} 
    return innateMagic;
};