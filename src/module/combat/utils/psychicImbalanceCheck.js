import {PsychicPowerDisciplines } from '../../types/psychic/PsychicPowerItemConfig.js';

// const systemDisciplines = {
//     [PsychicPowerDisciplines.THE_MATRIAL_POWERS]: 'anima.ui.psychic.psychicPowers.discipline.matrial.title',
//     [PsychicPowerDisciplines.TELEPATHY]: 'anima.ui.psychic.psychicPowers.discipline.telepathy.title',
//     [PsychicPowerDisciplines.TELEKINESIS]: 'anima.ui.psychic.psychicPowers.discipline.telekenisis.title',
//     [PsychicPowerDisciplines.PYROKINESIS]: 'anima.ui.psychic.psychicPowers.discipline.pyrokinesis.title',
//     [PsychicPowerDisciplines.CRYOKINESIS]: 'anima.ui.psychic.psychicPowers.discipline.cryokinesis.title',
//     [PsychicPowerDisciplines.PHYSICAL_INCREASE]: 'anima.ui.psychic.psychicPowers.discipline.physicalIncrease.title',
//     [PsychicPowerDisciplines.ENERGY]: 'anima.ui.psychic.psychicPowers.discipline.energy.title',
//     [PsychicPowerDisciplines.TELEMETRY]: 'anima.ui.psychic.psychicPowers.discipline.telemetry.title',
//     [PsychicPowerDisciplines.SENTIENT]: 'anima.ui.psychic.psychicPowers.discipline.sentient.title'
// } Usar Localize para varios idiomas
const systemDisciplines = {
    [PsychicPowerDisciplines.THE_MATRIAL_POWERS]: "-",
    [PsychicPowerDisciplines.TELEPATHY]: "Telepatía",
    [PsychicPowerDisciplines.TELEKINESIS]: "Telequinesis",
    [PsychicPowerDisciplines.PYROKINESIS]: "Piroquinesis",
    [PsychicPowerDisciplines.CRYOKINESIS]: "Crioquinesis",
    [PsychicPowerDisciplines.PHYSICAL_INCREASE]: "Inc. Físico",
    [PsychicPowerDisciplines.ENERGY]: "Energía",
    [PsychicPowerDisciplines.TELEMETRY]: "Telemetría",
    [PsychicPowerDisciplines.SENTIENT]: "Sentiente"
}

export const psychicImbalanceCheck = (discipline, advantages) => {
    const regExp = new RegExp(`${systemDisciplines[discipline]}`);
    if (regExp.test(advantages.map(i => i.name))) {return 1}
    else {return 0}
    };