export const withstandPainBonus = (difficulty) => {
    if (difficulty < 80) { return 0 }
    else if (difficulty < 120) { return 10 }
    else if (difficulty < 140) { return 20 }
    else if (difficulty < 180) { return 30 }
    else if (difficulty < 240) { return 40 }
    else if (difficulty < 280) { return 50 }
    else if (difficulty < 320) { return 60 }
    else if (difficulty < 440) { return 70 }
    else { return 80 }
}