export const rollToMessageFlavor = (text, roll) => {
  if (roll.abfRoll.success) {
    return `<b style="color:green">${text}</b>`
  } else if (roll.abfRoll.fumbled) {
    return `<b style="color:red">${text}</b>`
  } else {
    return `<b>${text}</b>`
  }
};
