
import ABFFoundryRoll from '../../rolls/ABFFoundryRoll.js';
export const getGeneralLocation = () => {
  const roll = new ABFFoundryRoll('1d100');
  roll.roll();
  const generalLocation = { specific: 'none', general: 'none' };
  if (roll.total < 11) {
    generalLocation.specific = 'ribs';
    generalLocation.general = 'torso';
  } else if (roll.total < 21) {
    generalLocation.specific = 'shoulder';
    generalLocation.general = 'torso';
  } else if (roll.total < 31) {
    generalLocation.specific = 'stomach';
    generalLocation.general = 'torso';
  } else if (roll.total < 36) {
    generalLocation.specific = 'kidneys';
    generalLocation.general = 'torso';
  } else if (roll.total < 49) {
    generalLocation.specific = 'chest';
    generalLocation.general = 'torso';
  } else if (roll.total < 51) {
    generalLocation.specific = 'heart';
    generalLocation.general = 'torso';
  } else if (roll.total < 55) {
    generalLocation.specific = 'upperForearm';
    generalLocation.general = 'rightArm';
  } else if (roll.total < 59) {
    generalLocation.specific = 'lowerForearm';
    generalLocation.general = 'rightArm';
  } else if (roll.total < 61) {
    generalLocation.specific = 'hand';
    generalLocation.general = 'rightArm';
  } else if (roll.total < 65) {
    generalLocation.specific = 'upperForearm';
    generalLocation.general = 'leftArm';
  } else if (roll.total < 69) {
    generalLocation.specific = 'lowerForearm';
    generalLocation.general = 'leftArm';
  } else if (roll.total < 71) {
    generalLocation.specific = 'hand';
    generalLocation.general = 'leftArm';
  } else if (roll.total < 75) {
    generalLocation.specific = 'thigh';
    generalLocation.general = 'rightLeg';
  } else if (roll.total < 79) {
    generalLocation.specific = 'calf';
    generalLocation.general = 'rightLeg';
  } else if (roll.total < 81) {
    generalLocation.specific = 'foot';
    generalLocation.general = 'rightLeg';
  } else if (roll.total < 85) {
    generalLocation.specific = 'thigh';
    generalLocation.general = 'leftLeg';
  } else if (roll.total < 89) {
    generalLocation.specific = 'calf';
    generalLocation.general = 'leftLeg';
  } else if (roll.total < 91) {
    generalLocation.specific = 'foot';
    generalLocation.general = 'leftLeg';
  } else {
    generalLocation.specific = 'head';
    generalLocation.general = 'head';
  }
  return generalLocation;
};
