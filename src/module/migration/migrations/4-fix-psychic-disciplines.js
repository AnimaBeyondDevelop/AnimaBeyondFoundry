//import { systemDataField } from '../../../types/foundry-vtt-types/src/foundry/common/data/fields.mjs.js';

/** @typedef {import('./Migration').Migration} Migration

/** @type Migration */
import { ABFItems } from '../../items/ABFItems';

export const Migration4PsychicDisciplines = {
  version: 1,
  title: 'disciplinas psiquicas',
  description: `Disciplinas psiquicas`,
  async updateActor(actor) {

    //primero pasamos el lenguaje que tenemos y vemos que bloque ejecutamos
    //luego, vemos que hay escrito en esa disciplina, y lo relacionamos con una ya existente
    //pasamos lo escrito sin mayusculas ni accentos
    //y si algo no se reconoce, se pone como un "Desconocido"

    for (let i = 0; i < actor.system.psychic.psychicDisciplines.length; i++) {
      actor.system.psychic.psychicDisciplines[i].name = actor.system.psychic.psychicDisciplines[i].name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,"");
      /*
       actor.system.psychic.psychicDisciplines[i].name= actor.system.psychic.psychicDisciplines[i].name.toLowerCase();     
     actor.system.psychic.psychicDisciplines[i].name = actor.system.psychic.psychicDisciplines[i].name.normalize('NFD').replace(/[\u0300-\u036f]/g,"");

      actor.system.psychic.psychicDisciplines[i].name.paragraph.replace("á", 'a');
      actor.system.psychic.psychicDisciplines[i].name.paragraph.replace("é", 'e');
      actor.system.psychic.psychicDisciplines[i].name.paragraph.replace("í", 'i');
      actor.system.psychic.psychicDisciplines[i].name.paragraph.replace("ó", 'o');
      actor.system.psychic.psychicDisciplines[i].name.paragraph.replace("ú", 'u');
      actor.system.psychic.psychicDisciplines[i].name.paragraph.replace("à", 'a');
      actor.system.psychic.psychicDisciplines[i].name.paragraph.replace("è", 'e');
      actor.system.psychic.psychicDisciplines[i].name.paragraph.replace("ì", 'i');
      actor.system.psychic.psychicDisciplines[i].name.paragraph.replace("ò", 'o');
      actor.system.psychic.psychicDisciplines[i].name.paragraph.replace("ù", 'u');*/
    }
    
    for (let i = 0; i < actor.system.psychic.psychicDisciplines.length; i++) {
      const id = actor.system.psychic.psychicDisciplines[i].id
      const name = actor.system.psychic.psychicDisciplines[i].name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
      const system = { imbalance: false }
      const itemData = { id, name, system }
      await actor.updateInnerItem({ type: ABFItems.PSYCHIC_DISCIPLINE, ...itemData });
  }

/*
    if (game.i18n.lang === "es") {
      for (let i = 0; i < actor.system.psychic.psychicDisciplines.length; i++) {
        switch (actor.system.psychic.psychicDisciplines[i].name) {
          case "telepatia":
            //actor.system.psychic.psychicDisciplines[i].name = "telepathy"
            break;

          case "telequinesis":
            actor.system.psychic.psychicDisciplines[i].name = "telekenisis"
            break;

          case "piroquinesis":
            actor.system.psychic.psychicDisciplines[i].name = "pyrokinesis"
            break;

          case "crioquinesis":
            actor.system.psychic.psychicDisciplines[i].name = "cryokinesis"
            break;

          case "incremento fisico":
            actor.system.psychic.psychicDisciplines[i].name = "physicalIncrease"
            break;

          case "energia":
            actor.system.psychic.psychicDisciplines[i].name = "energy"
            break;

          case "telemetria":
            actor.system.psychic.psychicDisciplines[i].name = "telemetry"
            break;

          case "sentiente":
            actor.system.psychic.psychicDisciplines[i].name = "sentient"
            break;

          case "causalidad":
            actor.system.psychic.psychicDisciplines[i].name = "causality"
            break;

          case "electromagnetismo":
            actor.system.psychic.psychicDisciplines[i].name = "electromagnetism"
            break;

          case "teletransporte":
            actor.system.psychic.psychicDisciplines[i].name = "teleportation"
            break;

          case "luz":
            actor.system.psychic.psychicDisciplines[i].name = "light"
            break;

          case "hipersensibilidad":
            actor.system.psychic.psychicDisciplines[i].name = "hypersensitivity"
            break;

          default:
            actor.system.psychic.psychicDisciplines[i].name = "unknown"

        } 
      }
    }

    if (game.i18n.lang === "en") {
      for (let i = 0; i < actor.system.psychic.psychicDisciplines.length; i++) {
        switch (actor.system.psychic.psychicDisciplines[i].name) {
          case "telepathy":
            actor.system.psychic.psychicDisciplines[i].name = "telepathy"
            break;

          case "telekenisis":
            actor.system.psychic.psychicDisciplines[i].name = "telekenisis"
            break;

          case "pyrokinesis":
            actor.system.psychic.psychicDisciplines[i].name = "pyrokinesis"
            break;

          case "cryokinesis":
            actor.system.psychic.psychicDisciplines[i].name = "cryokinesis"
            break;

          case "physical increase":
            actor.system.psychic.psychicDisciplines[i].name = "physicalIncrease"
            break;

          case "energy":
            actor.system.psychic.psychicDisciplines[i].name = "energy"
            break;

          case "telemetry":
            actor.system.psychic.psychicDisciplines[i].name = "telemetry"
            break;

          case "sentient":
            actor.system.psychic.psychicDisciplines[i].name = "sentient"
            break;

          case "causality":
            actor.system.psychic.psychicDisciplines[i].name = "causality"
            break;

          case "electromagnetism":
            actor.system.psychic.psychicDisciplines[i].name = "electromagnetism"
            break;

          case "teleportation":
            actor.system.psychic.psychicDisciplines[i].name = "teleportation"
            break;

          case "light":
            actor.system.psychic.psychicDisciplines[i].name = "light"
            break;

          case "hypersensitivity":
            actor.system.psychic.psychicDisciplines[i].name = "hypersensitivity"
            break;

          default:
            actor.system.psychic.psychicDisciplines[i].name = "unknown"

        } 
      }
    }

    if (game.i18n.lang === "fr") {
      for (let i = 0; i < actor.system.psychic.psychicDisciplines.length; i++) {
        switch (actor.system.psychic.psychicDisciplines[i].name) {
          case "telepathie":
            actor.system.psychic.psychicDisciplines[i].name = "telepathy"
            break;

          case "telekinesie":
            actor.system.psychic.psychicDisciplines[i].name = "telekenisis"
            break;

          case "pyrokinesie":
            actor.system.psychic.psychicDisciplines[i].name = "pyrokinesis"
            break;

          case "cryokinesie":
            actor.system.psychic.psychicDisciplines[i].name = "cryokinesis"
            break;

          case "augmentation physique":
            actor.system.psychic.psychicDisciplines[i].name = "physicalIncrease"
            break;

          case "energie":
            actor.system.psychic.psychicDisciplines[i].name = "energy"
            break;

          case "telemetrie":
            actor.system.psychic.psychicDisciplines[i].name = "telemetry"
            break;

          case "sensation":
            actor.system.psychic.psychicDisciplines[i].name = "sentient"
            break;

          case "causalite":
            actor.system.psychic.psychicDisciplines[i].name = "causality"
            break;

          case "electromagnetisme":
            actor.system.psychic.psychicDisciplines[i].name = "electromagnetism"
            break;

          case "teleportation":
            actor.system.psychic.psychicDisciplines[i].name = "teleportation"
            break;

          case "lumiere":
            actor.system.psychic.psychicDisciplines[i].name = "light"
            break;

          case "hypersensibilite":
            actor.system.psychic.psychicDisciplines[i].name = "hypersensitivity"
            break;

          default:
            actor.system.psychic.psychicDisciplines[i].name = "unknown"

        } 
      }
    }
*/

    /*
        "anima.ui.psychic.psychicPowers.discipline.telepathy.title": "Telepathy",
        "anima.ui.psychic.psychicPowers.discipline.telekenisis.title": "Telekenisis",
        "anima.ui.psychic.psychicPowers.discipline.pyrokinesis.title": "Pyrokinesis",
        "anima.ui.psychic.psychicPowers.discipline.cryokinesis.title": "Cryokinesis",
        "anima.ui.psychic.psychicPowers.discipline.physicalIncrease.title": "Physical Inc.",
        "anima.ui.psychic.psychicPowers.discipline.energy.title": "Energy",
        "anima.ui.psychic.psychicPowers.discipline.telemetry.title": "Telemetry",
        "anima.ui.psychic.psychicPowers.discipline.sentient.title": "Sentient",
        "anima.ui.psychic.psychicPowers.discipline.causality.title": "Causality",
        "anima.ui.psychic.psychicPowers.discipline.electromagnetism.title": "Electromagnetism",
        "anima.ui.psychic.psychicPowers.discipline.teleportation.title": "Teleportation",
        "anima.ui.psychic.psychicPowers.discipline.light.title": "Light",
        "anima.ui.psychic.psychicPowers.discipline.hypersensitivity.title": "Hypersensitivity",
    */

    return actor;
  }
};
