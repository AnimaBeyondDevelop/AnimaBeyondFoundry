import {PsychicPowerDisciplines } from '../../types/psychic/PsychicPowerItemConfig.js';
export const psychicImbalanceCheck = (discipline, advantages, mentalPatterns) => {
    const systemDisciplines = {
        [PsychicPowerDisciplines.THE_MATRIAL_POWERS]: game.i18n.localize('anima.ui.psychic.psychicPowers.discipline.matrial.title'),
        [PsychicPowerDisciplines.TELEPATHY]: game.i18n.localize('anima.ui.psychic.psychicPowers.discipline.telepathy.title'),
        [PsychicPowerDisciplines.TELEKINESIS]: game.i18n.localize('anima.ui.psychic.psychicPowers.discipline.telekenisis.title'),
        [PsychicPowerDisciplines.PYROKINESIS]: game.i18n.localize('anima.ui.psychic.psychicPowers.discipline.pyrokinesis.title'),
        [PsychicPowerDisciplines.CRYOKINESIS]: game.i18n.localize('anima.ui.psychic.psychicPowers.discipline.cryokinesis.title'),
        [PsychicPowerDisciplines.PHYSICAL_INCREASE]: game.i18n.localize('anima.ui.psychic.psychicPowers.discipline.physicalIncrease.title'),
        [PsychicPowerDisciplines.ENERGY]: game.i18n.localize('anima.ui.psychic.psychicPowers.discipline.energy.title'),
        [PsychicPowerDisciplines.TELEMETRY]: game.i18n.localize('anima.ui.psychic.psychicPowers.discipline.telemetry.title'),
        [PsychicPowerDisciplines.SENTIENT]: game.i18n.localize('anima.ui.psychic.psychicPowers.discipline.sentient.title')
    };
    const regExpDisc = new RegExp(`${systemDisciplines[discipline]}`);
    const regExpMental = new RegExp("Valentía");
    let imbalance = 0
    if (regExpDisc.test(advantages?.map(i => i.name))) {imbalance++}
    if (regExpMental.test(mentalPatterns?.map(i => i.name))) {imbalance++}
    return imbalance
    };