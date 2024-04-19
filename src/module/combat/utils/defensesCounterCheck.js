export const defensesCounterCheck = (defensesCounter) => {
    const multipleDefensesPenalty = [-0, -30, -50, -70, -90];
    let currentDefensePenalty = multipleDefensesPenalty[Math.min(defensesCounter, 4)]
    return currentDefensePenalty
    };

