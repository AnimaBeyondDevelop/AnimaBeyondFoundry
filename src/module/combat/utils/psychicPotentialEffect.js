export const psychicPotentialEffect = (potential, imbalance, inhuman, zen) => {
    const Effect = [20, 40, 80, 120, 140, 180, 240, 280, 320, 440];
    let newPotential = 0;
    let max = zen? 9 : inhuman? 8 : 7;
    if (potential < 40) {newPotential = Effect[0+imbalance]}
    else if(potential < 80) {newPotential = Effect[1+imbalance]}
    else if(potential < 120) {newPotential = Effect[2+imbalance]} 
    else if(potential < 140) {newPotential = Effect[3+imbalance]} 
    else if(potential < 180) {newPotential = Effect[4+imbalance]} 
    else if(potential < 240) {newPotential = Effect[5+imbalance]} 
    else if(potential < 280) {newPotential = Effect[6+imbalance]} 
    else if(potential < 320) {newPotential = Effect[Math.min(max, 7+imbalance)]}
    else if(potential < 440) {newPotential = Effect[Math.min(max, 8+imbalance)]}
    else {newPotential = Effect[Math.min(max, 9)]}
    return newPotential
};