import { Templates } from '../../utils/constants';
import ABFFoundryRoll from '../../rolls/ABFFoundryRoll.js';
export const getResistanceRoll = async (value, type, attacker, defender) => {
  const resistance =
    defender.actor.system.characteristics.secondaries.resistances[type].base.value;
  let formula = `1d100 + ${resistance ?? 0}`;
  const resistanceRoll = new ABFFoundryRoll(formula, defender.actor.system);
  resistanceRoll.roll();
  const { i18n } = game;
  const flavor = i18n.format('macros.combat.dialog.physicalDefense.resist.title', {
    target: attacker.name
  });
  resistanceRoll.toMessage({
    speaker: ChatMessage.getSpeaker({ token: defender }),
    flavor
  });

  const data = {
    attacker: {
      name: attacker.name,
      img: attacker.texture.src
    },
    defender: {
      name: defender.name,
      img: defender.texture.src
    },
    result: resistanceRoll.total - value,
    type: 'resistance',
    resistCheck: value
  };

  await renderTemplate(Templates.Chat.CheckResult, data).then(content => {
    ChatMessage.create({
      content
    });
  });
  return resistanceRoll;
};
