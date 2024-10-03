export const rollToMessageFlavor = (text, roll) => {
  if (roll.abfRoll.success) {
    return text.replace('<b>', '<b style="color:green">')
  } else if (roll.abfRoll.fumbled) {
    return text.replace('<b>', '<b style="color:red">')
  } else {
    return text
  }
};
