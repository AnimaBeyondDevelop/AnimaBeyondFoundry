export const psychicPotentialEffect = (potential, imbalance) => {
    const Effect = [20, 40, 80, 120, 140, 180, 240, 280, 320, 440];
    let newPotential = 0;
    let d = 0;
    if (imbalance) d = 1;
    if (potential < 40) {newPotential = Effect[0+d]}
    else if(potential < 80) {newPotential = Effect[1+d]}
    else if(potential < 120) {newPotential = Effect[2+d]} 
    else if(potential < 140) {newPotential = Effect[3+d]} 
    else if(potential < 180) {newPotential = Effect[4+d]} 
    else if(potential < 240) {newPotential = Effect[5+d]} 
    else if(potential < 280) {newPotential = Effect[6+d]} 
   // else if(potential < 320) {newPotential = Effect[7+d]}
   // else if(potential < 440) {newPotential = Effect[8+d]}
    else {newPotential = Effect[7]}
    return newPotential
    };