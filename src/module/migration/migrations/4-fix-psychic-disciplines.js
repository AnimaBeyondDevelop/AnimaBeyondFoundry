/** @typedef {import('./Migration').Migration} Migration

/** @type Migration */

export const Migration4PsychicDisciplines = {
  version: 4,
  title: 'Normalise Psychic Disciplines',
  description:
    'Psychic Disciplines are going to be normalised to standard strings. ' +
    'Any unrecognised discipline will become "Unknown Discipline".',
  async updateActor(actor) {
    const dictionary = {
      // es entries
      telepatia: 'telepathy',
      telequinesis: 'telekenisis',
      piroquinesis: 'pyrokinesis',
      crioquinesis: 'cryokinesis',
      'incremento fisico': 'physicalIncrease',
      energia: 'energy',
      telemetria: 'telemetry',
      sentiente: 'sentient',
      causalidad: 'causality',
      electromagnetismo: 'electromagnetism',
      teletransporte: 'teleportation',
      luz: 'light',
      hipersensibilidad: 'hypersensitivity',
      // en entries
      telepathy: 'telepathy',
      telekenisis: 'telekenisis',
      pyrokinesis: 'pyrokinesis',
      cryokinesis: 'cryokinesis',
      'physical increase': 'physicalIncrease',
      energy: 'energy',
      telemetry: 'telemetry',
      sentient: 'sentient',
      causality: 'causality',
      electromagnetism: 'electromagnetism',
      teleportation: 'teleportation',
      light: 'light',
      hypersensitivity: 'hypersensitivity',
      // fr entries
      telepathie: 'telepathy',
      telekinesie: 'telekenisis',
      pyrokinesie: 'pyrokinesis',
      cryokinesie: 'cryokinesis',
      'augmentation physique': 'physicalIncrease',
      energie: 'energy',
      telemetrie: 'telemetry',
      sensation: 'sentient',
      causalite: 'causality',
      electromagnetisme: 'electromagnetism',
      teleportation: 'teleportation',
      lumiere: 'light',
      hypersensibilite: 'hypersensitivity'
    };

    for (const discipline of actor.system.psychic.psychicDisciplines) {
      const { id, system, name } = discipline;
      const newName =
        dictionary[
          name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
        ] || 'unknown';
      await actor.updateItem({ id, system, name: newName });
    }

    return actor;
  }
};
