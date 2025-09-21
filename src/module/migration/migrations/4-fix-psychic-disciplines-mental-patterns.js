/** @typedef {import('./Migration').Migration} Migration

/** @type Migration */

export const Migration4PsychicDisciplinesMentalPatterns = {
  id: 'migration_fix-psychic-disciplines-mental-patterns',
  version: '1.0.0',
  order: 1,
  title: 'Normalise Psychic Disciplines and Mental Patterns',
  description:
    'Psychic Disciplines and Mental Patterns are going to be normalised to standard strings. ' +
    'Any unrecognised discipline or pattern will become "Unknown Discipline" or "Unknown Pattern".',
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
      valentia: 'courage',
      cobardia: 'cowardice',
      compasion: 'compassion',
      psicopatia: 'psychopath',
      locura: 'madness',
      extroversion: 'extroversion',
      introversion: 'introversion',
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
      courage: 'courage',
      cowardice: 'cowardice',
      compassion: 'compassion',
      psychopath: 'psychopath',
      madness: 'madness',
      extroversion: 'extroversion',
      introversion: 'introversion',
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
      hypersensibilite: 'hypersensitivity',
      courage: 'courage',
      lachete: 'cowardice',
      compassion: 'compassion',
      psychopathe: 'psychopath',
      folie: 'madness',
      extraversion: 'extroversion',
      introversion: 'introversion'
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

    for (const pattern of actor.system.psychic.mentalPatterns) {
      const { id, system, name } = pattern;
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
