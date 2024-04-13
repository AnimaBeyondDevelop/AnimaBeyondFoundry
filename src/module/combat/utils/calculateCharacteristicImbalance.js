export const calculateCharacteristicImbalance = (char1, char2) => {
    let calculateChar = char1 - char2 - 4;
    let charMod = calculateChar > 0 ? calculateChar : 0
    return charMod
    };

