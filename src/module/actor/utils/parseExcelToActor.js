import { ABFActor } from '../ABFActor';
import { ABFItems } from '../../items/ABFItems';
import { calculateRegenerationTypeFromConstitution } from './prepareActor/calculations/actor/general/calculations/calculateRegenerationTypeFromConstitution';
import { calculateAttributeModifier } from './prepareActor/calculations/util/calculateAttributeModifier';
import { INITIAL_TECHNIQUE_DATA } from '../../types/domine/TechniqueItemConfig';
import { INITIAL_MENTAL_PATTERN_DATA } from '../../types/psychic/MentalPatternItemConfig';

/**
 * Parses excel data to actor data
 *
 * @param {any} excelData - provided exel data
 * @param {ABFActor} actor - provided Actor to update
 */
export const parseExcelToActor = async (excelData, actor) => {
  const requiredExcelVersions = ['8.6.4', '8.7.0'];
  const excelVersionSplitted = SetEmptyIfUndefined(excelData.Version)
    .split(' ')
    .map(value => value.trim())
    .filter(element => element !== '');

  if (excelVersionSplitted.length > 0) {
    let excelVersion = excelVersionSplitted.pop();
    if (!requiredExcelVersions.some(item => item === excelVersion)) {
      const versionWarning =
        game.i18n.localize('anima.ui.importDataFromExcelWarning') +
        requiredExcelVersions.join(', ');
      ui.notifications.warn(versionWarning);
      return;
    }
  }

  const movementModifier = excelData.TipodeMovimiento - excelData.AGI;
  const regenerationModifier =
    excelData.Regeneración_final -
    calculateRegenerationTypeFromConstitution(excelData.CON);
  const extraDamage =
    (excelData.DañoIncrementado ? 10 : 0) + (excelData.Extensióndelauraalarma ? 10 : 0);
  const conResistance =
    excelData.Presencia_final + calculateAttributeModifier(excelData.CON);
  const podResistance =
    excelData.Presencia_final + calculateAttributeModifier(excelData.POD);
  const volResistance =
    excelData.Presencia_final + calculateAttributeModifier(excelData.VOL);

  const presenciaBase = excelData.Nivel_Total <= 0 ? 20 : 25 + excelData.Nivel_Total * 5;

  const bonoPresencia = excelData.Presencia_final - presenciaBase;

  //Esto es para cuando esté la automatización de las resistencias
  const bonoRF = excelData.RF_final - conResistance;
  const bonoRE = excelData.RE_final - conResistance;
  const bonoRV = excelData.RV_final - conResistance;
  const bonoRM = excelData.RM_final - podResistance;
  const bonoRP = excelData.RP_final - volResistance;

  const habilidades = separarHabilidadesKi(excelData.HabilidadesKiNemesis);
  const habilidadesKi = SetEmptyIfUndefined(habilidades.habilidadesKi)
    .split(',')
    .map(value => value.trim())
    .filter(element => element !== '');
  const habilidadesNem = SetEmptyIfUndefined(habilidades.habilidadesNemesis)
    .split(',')
    .map(value => value.trim())
    .filter(element => element !== '');
  const arsMagnus = SetEmptyIfUndefined(excelData.ArsMagnusSeleccionados)
    .split(',')
    .map(value => value.trim())
    .filter(element => element !== '');
  const armasConocidas = SetEmptyIfUndefined(excelData.Armas_Conocidas)
    .split(',')
    .map(value => value.trim())
    .filter(element => element !== '');
  const categorias = SetEmptyIfUndefined(excelData.CategoríasSeleccionadas)
    .split('/')
    .map(value => value.trim())
    .filter(element => element !== '');
  const idiomasExtra = SetEmptyIfUndefined(excelData.IdiomasExtra)
    .split(',')
    .map(value => value.trim())
    .filter(element => element !== '');
  const ventajasComunes = SetEmptyIfUndefined(excelData.VentajasComunesSeleccionadas)
    .split(',')
    .map(value => value.trim())
    .filter(element => element !== '');
  const ventajasSobrenaturales = SetEmptyIfUndefined(
    excelData.VentajasSobrenaturalesSeleccionadas
  )
    .split(',')
    .map(value => value.trim())
    .filter(element => element !== '');
  const ventajasTrasfondo = SetEmptyIfUndefined(excelData.VentajasTrasfondoSeleccionadas)
    .split(',')
    .map(value => value.trim())
    .filter(element => element !== '');
  const legadosDeSangre = SetEmptyIfUndefined(excelData.LegadosSeleccionados)
    .split(',')
    .map(value => value.trim())
    .filter(element => element !== '');
  const desventajas = SetEmptyIfUndefined(excelData.DesventajasSeleccionadas)
    .split(',')
    .map(value => value.trim())
    .filter(element => element !== '');
  const elan = separarElan(SetEmptyIfUndefined(excelData.ElanSeleccionado));
  const aptoParaElDesarrolloDeLaMagia = ventajasSobrenaturales.includes(
    'Apto desarrollo de la magia'
  );
  const resistenciaALaFatigaPsiquica = ventajasSobrenaturales.includes(
    'Res. a la fatiga psíquica'
  );
  const artesMarciales = SetEmptyIfUndefined(excelData.ArtesMarcialesSeleccionadas)
    .split(',')
    .map(value => value.trim())
    .filter(element => element !== '');
  const tablasDeEstilo = SetEmptyIfUndefined(excelData.TablasDeEstilo)
    .split(',')
    .map(value => value.trim())
    .filter(element => element !== '');
  const tecnicasKi = SetEmptyIfUndefined(excelData.TécnicasKi)
    .split(',')
    .map(value => value.trim())
    .filter(element => element !== '');
  const invocaciones = SetEmptyIfUndefined(excelData.InvocacionesSeleccionadas)
    .split(',')
    .map(value => value.trim())
    .filter(element => element !== '');
  const viasMagia = separarNivelDeVia(
    SetEmptyIfUndefined(excelData.VíasDeMagiaSeleccionadas)
      .split(',')
      .map(value => value.trim())
      .filter(element => element !== '')
  );
  const conjurosMantenidos = SetEmptyIfUndefined(excelData.Mantenimientos_Magia)
    .split(';')
    .map(value => value.trim())
    .filter(element => element !== '');
  const conjurosSeleccionados = SetEmptyIfUndefined(excelData.ConjurosSeleccionados)
    .split(';')
    .map(value => value.trim())
    .filter(element => element !== '');
  const metamagias = SetEmptyIfUndefined(excelData.MetamagiasSeleccionadas)
    .split(';')
    .map(value => value.trim())
    .filter(element => element !== '');
  const disciplinas_psi = SetEmptyIfUndefined(excelData.Disciplinas_Psi_Actuales)
    .split(',')
    .map(value => value.trim())
    .filter(element => element !== '');
  const patrones_psi = SetEmptyIfUndefined(excelData.Patrones_Psi_Actuales)
    .split(',')
    .map(value => value.trim())
    .filter(element => element !== '');

  //Remove previous adventages
  let previousAdventages = [];
  actor.system.general.advantages.forEach(adventage => {
    previousAdventages.push(adventage._id);
  });

  previousAdventages.forEach(async adventageId => {
    await actor.deleteItem(adventageId);
  });

  //Remove previous disadventages
  let previousDisadventages = [];
  actor.system.general.disadvantages.forEach(disadvantage => {
    previousDisadventages.push(disadvantage._id);
  });

  previousDisadventages.forEach(async disadventageId => {
    await actor.deleteItem(disadventageId);
  });

  //Remove psi disciplines
  let previousPsiDisciplines = [];
  actor.system.psychic.psychicDisciplines.forEach(discipline => {
    previousPsiDisciplines.push(discipline._id);
  });

  previousPsiDisciplines.forEach(async disciplineId => {
    await actor.deleteItem(disciplineId);
  });

  //Remove psi patterns
  let previousPsiPatterns = [];
  actor.system.psychic.mentalPatterns.forEach(pattern => {
    previousPsiPatterns.push(pattern._id);
  });

  previousPsiPatterns.forEach(async patternId => {
    await actor.deleteItem(patternId);
  });

  await actor.update({
    name: excelData.Nombre,
    prototypeToken: {
      name: excelData.Nombre
    },
    system: {
      characteristics: {
        primaries: {
          agility: {
            base: {
              value: excelData.AGI
            }
          },
          constitution: {
            base: {
              value: excelData.CON
            }
          },
          dexterity: {
            base: {
              value: excelData.DES
            }
          },
          strength: {
            base: {
              value: excelData.FUE
            }
          },
          intelligence: {
            base: {
              value: excelData.INT
            }
          },
          power: {
            base: {
              value: excelData.POD
            }
          },
          perception: {
            base: {
              value: excelData.PER
            }
          },
          willPower: {
            base: {
              value: excelData.VOL
            }
          }
        },
        secondaries: {
          fatigue: {
            value: excelData.Cansancio,
            max: excelData.Cansancio
          },
          initiative: {
            base: {
              value: excelData.Turno_Nat_final
            }
          },
          lifePoints: {
            value: excelData.Vida_final,
            max: excelData.Vida_final
          },
          movementType: {
            mod: {
              value: movementModifier
            }
          },
          regenerationType: {
            mod: {
              value: regenerationModifier
            }
          },
          resistances: {
            physical: {
              special: {
                value: bonoRF
              }
            },
            disease: {
              special: {
                value: bonoRE
              }
            },
            poison: {
              special: {
                value: bonoRV
              }
            },
            magic: {
              special: {
                value: bonoRM
              }
            },
            psychic: {
              special: {
                value: bonoRP
              }
            }
          }
        }
      },
      combat: {
        attack: {
          base: {
            value: Math.max(excelData.HA_final, excelData.HA_SinArmas_final)
          }
        },
        block: {
          base: {
            value: Math.max(excelData.HP_final, excelData.HP_SinArmas_final)
          }
        },
        dodge: {
          base: {
            value: Math.max(excelData.HE_final, excelData.HE_SinArmas_final)
          }
        },
        wearArmor: {
          base: {
            value: excelData.LlevarArmadura_final
          }
        },
        combatSpecialSkills: [],
        combatTables: []
      },
      general: {
        presence: {
          special: {
            value: bonoPresencia
          }
        },
        modifiers: {
          extraDamage: {
            base: {
              value: extraDamage
            }
          }
        },
        settings: {
          inhuman: {
            value: excelData.Inhumanidad
          },
          zen: {
            value: excelData.Zen
          }
        },
        aspect: {
          hair: {
            value: excelData.Pelo
          },
          eyes: {
            value: excelData.Ojos
          },
          height: {
            value: excelData.Altura + ' m'
          },
          weight: {
            value: excelData.Peso + ' Kg'
          },
          age: {
            value: excelData.Edad
          },
          gender: {
            value: excelData.Sexo
          },
          race: {
            value: excelData.Raza + ' (' + excelData.Nephilim + ')'
          },
          ethnicity: {
            value: excelData.Etnia
          },
          appearance: {
            value: excelData.Apariencia
          },
          size: {
            value: excelData.Tamaño
          }
        },
        languages: {
          base: {
            value: excelData.IdiomaBase
          },
          others: []
        },
        levels: [],
        level: {
          value: excelData.Nivel_Total
        },
        destinyPoints: {
          base: {
            value: excelData.PuntosDeDestino_Max - excelData.PuntosDeDestino_Gastados
          },
          final: {
            value: excelData.PuntosDeDestino_Max
          }
        },
        advantages: [],
        disadvantages: [],
        elan: [],
        titles: [],
        money: {
          cooper: {
            value: excelData.Monedas_Oro
          },
          silver: {
            value: excelData.Monedas_Plata
          },
          gold: {
            value: excelData.Monedas_Cobre
          }
        }
      },
      mystic: {
        act: {
          main: {
            base: {
              value: excelData.ACT_final
            }
          }
        },
        magicProjection: {
          imbalance: {
            defensive: {
              base: {
                value: excelData.ProyecciónMágicaDefensiva_final
              }
            },
            offensive: {
              base: {
                value: excelData.ProyecciónMágicaOfensiva_final
              }
            }
          }
        },
        summoning: {
          summon: {
            base: {
              value: excelData.Convocar_final
            }
          },
          control: {
            base: {
              value: excelData.Controlar_final
            }
          },
          bind: {
            base: {
              value: excelData.Atar_final
            }
          },
          banish: {
            base: {
              value: excelData.Desconvocar_final
            }
          }
        },
        zeon: {
          value: excelData.Zeón_final,
          max: excelData.Zeón_final
        },
        zeonRegeneration: {
          base: {
            value: excelData.RegZeon_final
          }
        },
        mysticSettings: {
          aptitudeForMagicDevelopment: aptoParaElDesarrolloDeLaMagia
        },
        summons: [],
        metamagics: [],
        spellMaintenances: [],
        selectedSpells: [],
        magicLevel: {
          total: {
            value: excelData.NiveldeMagia_final
          },
          used: {
            value: excelData.NivelMagia_usado
          },
          spheres: {
            darkness: {
              value: viasMagia.oscuridad
            },
            light: {
              value: viasMagia.luz
            },
            creation: {
              value: viasMagia.creacion
            },
            destruction: {
              value: viasMagia.destruccion
            },
            fire: {
              value: viasMagia.fuego
            },
            water: {
              value: viasMagia.agua
            },
            air: {
              value: viasMagia.aire
            },
            earth: {
              value: viasMagia.tierra
            },
            essence: {
              value: viasMagia.esencia
            },
            illusion: {
              value: viasMagia.ilusion
            },
            necromancy: {
              value: viasMagia.nigromancia
            }
          }
        }
      },
      psychic: {
        psychicPotential: {
          base: {
            value: excelData.PotencialPsi_final
          }
        },
        psychicProjection: {
          base: {
            value: excelData.Proyecciónpsíquica_final
          },
          imbalance: {
            offensive: {
              base: {
                value: excelData.Proyecciónpsíquica_final
              }
            },
            defensive: {
              base: {
                value: excelData.Proyecciónpsíquica_final
              }
            }
          }
        },
        psychicPoints: {
          value: excelData.CVLibres_actual,
          max: excelData.CVLibres_final
        },
        innatePsychicPower: {
          amount: {
            value: excelData.Innatos_Psi
          }
        },
        psychicSettings: {
          fatigueResistance: resistenciaALaFatigaPsiquica
        },
        psychicDisciplines: [],
        mentalPatterns: []
      },
      secondaries: {
        athletics: {
          acrobatics: {
            base: {
              value: excelData.Acrobacias_final
            }
          },
          athleticism: {
            base: {
              value: excelData.Atletismo_final
            }
          },
          ride: {
            base: {
              value: excelData.Montar_final
            }
          },
          swim: {
            base: {
              value: excelData.Nadar_final
            }
          },
          climb: {
            base: {
              value: excelData.Trepar_final
            }
          },
          jump: {
            base: {
              value: excelData.Saltar_final
            }
          },
          piloting: {
            base: {
              value: excelData.Pilotar_final
            }
          }
        },
        vigor: {
          composure: {
            base: {
              value: excelData.Frialdad_final
            }
          },
          featsOfStrength: {
            base: {
              value: excelData['P.Fuerza_final']
            }
          },
          withstandPain: {
            base: {
              value: excelData['Res.Dolor_final']
            }
          }
        },
        perception: {
          notice: {
            base: {
              value: excelData.Advertir_final
            }
          },
          search: {
            base: {
              value: excelData.Buscar_final
            }
          },
          track: {
            base: {
              value: excelData.Rastrear_final
            }
          }
        },
        intellectual: {
          animals: {
            base: {
              value: excelData.Animales_final
            }
          },
          science: {
            base: {
              value: excelData.Ciencia_final
            }
          },
          law: {
            base: {
              value: excelData.Ley_final
            }
          },
          herbalLore: {
            base: {
              value: excelData.Herbolaria_final
            }
          },
          history: {
            base: {
              value: excelData.Historia_final
            }
          },
          tactics: {
            base: {
              value: excelData.Tactica_final
            }
          },
          medicine: {
            base: {
              value: excelData.Medicina_final
            }
          },
          memorize: {
            base: {
              value: excelData.Memorizar_final
            }
          },
          navigation: {
            base: {
              value: excelData.Navegación_final
            }
          },
          occult: {
            base: {
              value: excelData.Ocultismo_final
            }
          },
          appraisal: {
            base: {
              value: excelData.Tasación_final
            }
          },
          magicAppraisal: {
            base: {
              value: excelData['V.Mágica_final']
            }
          }
        },
        social: {
          style: {
            base: {
              value: excelData.Estilo_final
            }
          },
          intimidate: {
            base: {
              value: excelData.Intimidar_final
            }
          },
          leadership: {
            base: {
              value: excelData.Liderazgo_final
            }
          },
          persuasion: {
            base: {
              value: excelData.Persuasión_final
            }
          },
          trading: {
            base: {
              value: excelData.Comercio_final
            }
          },
          streetwise: {
            base: {
              value: excelData.Callejeo_final
            }
          },
          etiquette: {
            base: {
              value: excelData.Etiqueta_final
            }
          }
        },
        subterfuge: {
          lockPicking: {
            base: {
              value: excelData.Cerrajería_final
            }
          },
          disguise: {
            base: {
              value: excelData.Disfraz_final
            }
          },
          hide: {
            base: {
              value: excelData.Ocultarse_final
            }
          },
          theft: {
            base: {
              value: excelData.Robo_final
            }
          },
          stealth: {
            base: {
              value: excelData.Sigilo_final
            }
          },
          trapLore: {
            base: {
              value: excelData.Trampería_final
            }
          },
          poisons: {
            base: {
              value: excelData.Venenos_final
            }
          }
        },
        creative: {
          art: {
            base: {
              value: excelData.Arte_final
            }
          },
          dance: {
            base: {
              value: excelData.Baile_final
            }
          },
          forging: {
            base: {
              value: excelData.Forja_final
            }
          },
          runes: {
            base: {
              value: excelData.Runas_final
            }
          },
          alchemy: {
            base: {
              value: excelData.Alquimia_final
            }
          },
          animism: {
            base: {
              value: excelData.Animismo_final
            }
          },
          music: {
            base: {
              value: excelData.Música_final
            }
          },
          sleightOfHand: {
            base: {
              value: excelData['T.Manos_final']
            }
          },
          ritualCalligraphy: {
            base: {
              value: excelData.Caligrafíaritual_final
            }
          },
          jewelry: {
            base: {
              value: excelData.Orfebrería_final
            }
          },
          tailoring: {
            base: {
              value: excelData.Confección_final
            }
          },
          puppetMaking: {
            base: {
              value: excelData['Conf.marionetas_final']
            }
          }
        }
      },
      domine: {
        martialKnowledge: {
          used: {
            value: excelData.CM_usado
          },
          max: {
            value: excelData.CM_final
          }
        },
        kiAccumulation: {
          strength: {
            base: {
              value: excelData.KiAccumulationFUE_final
            }
          },
          agility: {
            base: {
              value: excelData.KiAccumulationAGI_final
            }
          },
          dexterity: {
            base: {
              value: excelData.KiAccumulationDES_final
            }
          },
          constitution: {
            base: {
              value: excelData.KiAccumulationCON_final
            }
          },
          willPower: {
            base: {
              value: excelData.KiAccumulationVOL_final
            }
          },
          power: {
            base: {
              value: excelData.KiAccumulationPOD_final
            }
          },
          generic: {
            value: excelData.Ki_final,
            max: excelData.Ki_final
          }
        },
        kiSkills: [],
        nemesisSkills: [],
        arsMagnus: [],
        seals: {
          minor: {
            metal: {
              isActive: excelData.Sello_Metal_Menor === '1'
            },
            wind: {
              isActive: excelData.Sello_Aire_Menor === '1'
            },
            water: {
              isActive: excelData.Sello_Agua_Menor === '1'
            },
            wood: {
              isActive: excelData.Sello_Madera_Menor === '1'
            },
            fire: {
              isActive: excelData.Sello_Fuego_Menor === '1'
            }
          },
          major: {
            metal: {
              isActive: excelData.Sello_Metal_Mayor === '1'
            },
            wind: {
              isActive: excelData.Sello_Aire_Mayor === '1'
            },
            water: {
              isActive: excelData.Sello_Agua_Mayor === '1'
            },
            wood: {
              isActive: excelData.Sello_Madera_Mayor === '1'
            },
            fire: {
              isActive: excelData.Sello_Fuego_Mayor === '1'
            }
          }
        },
        specialSkills: [],
        techniques: [],
        martialArts: []
      }
    }
  });

  //Settear habilidades del Ki
  for (var i = 0; i < habilidadesKi.length; i++) {
    let abilityName = habilidadesKi[i];
    if (
      abilityName.indexOf('Detección del Ki') !== -1 ||
      abilityName.indexOf('Ocultación del Ki') !== -1
    ) {
      abilityName = splitAndRemoveLast(habilidadesKi[i]); //quita el valor de la detección y ocultación, deja solo el nombre
    }

    await actor.createInnerItem({
      name: abilityName,
      type: ABFItems.KI_SKILL
    });
  }

  //Settear habilidades del némesis
  for (var i = 0; i < habilidadesNem.length; i++) {
    await actor.createInnerItem({
      name: habilidadesNem[i],
      type: ABFItems.NEMESIS_SKILL
    });
  }

  //Settear ars magnus
  for (var i = 0; i < arsMagnus.length; i++) {
    await actor.createInnerItem({
      name: arsMagnus[i],
      type: ABFItems.ARS_MAGNUS
    });
    await actor.createInnerItem({
      name: arsMagnus[i],
      type: ABFItems.COMBAT_SPECIAL_SKILL
    });
  }

  for (var i = 0; i < categorias.length; i++) {
    let categorySubstrings = categorias[i]
      .split(' ')
      .map(value => value.trim())
      .filter(element => element !== '');

    if (isNaN(Number(categorySubstrings[categorySubstrings.length - 1]))) {
      await actor.createInnerItem({
        name: categorias[i],
        type: ABFItems.LEVEL,
        system: { level: excelData.Nivel_Total }
      });
    } else {
      let level = categorySubstrings.pop();
      await actor.createInnerItem({
        name: categorySubstrings.join(' '),
        type: ABFItems.LEVEL,
        system: { level: level }
      });
    }
  }

  for (var i = 0; i < idiomasExtra.length; i++) {
    await actor.createInnerItem({
      name: idiomasExtra[i],
      type: ABFItems.LANGUAGE
    });
  }

  for (var i = 0; i < ventajasComunes.length; i++) {
    await actor.createItem({
      name: ventajasComunes[i],
      type: ABFItems.ADVANTAGE
    });
  }

  for (var i = 0; i < ventajasSobrenaturales.length; i++) {
    await actor.createItem({
      name: ventajasSobrenaturales[i],
      type: ABFItems.ADVANTAGE
    });
  }

  for (var i = 0; i < ventajasTrasfondo.length; i++) {
    await actor.createItem({
      name: ventajasTrasfondo[i],
      type: ABFItems.ADVANTAGE
    });
  }

  for (var i = 0; i < legadosDeSangre.length; i++) {
    await actor.createItem({
      name: legadosDeSangre[i],
      type: ABFItems.ADVANTAGE
    });
  }

  for (var i = 0; i < desventajas.length; i++) {
    await actor.createItem({
      name: desventajas[i],
      type: ABFItems.DISADVANTAGE
    });
  }

  for (var i = 0; i < elan.length; i++) {
    await actor.createInnerItem({
      name: elan[i].deidad,
      type: ABFItems.ELAN,
      system: {
        level: { value: elan[i].nivel },
        powers: []
      }
    });
  }

  for (var i = 0; i < tablasDeEstilo.length; i++) {
    await actor.createInnerItem({
      name: tablasDeEstilo[i],
      type: ABFItems.COMBAT_TABLE
    });
    await actor.createInnerItem({
      name: tablasDeEstilo[i],
      type: ABFItems.SPECIAL_SKILL
    });
  }

  for (var i = 0; i < artesMarciales.length; i++) {
    if (artesMarciales[i].includes('Tabla de Armas:')) {
      await actor.createInnerItem({
        name: artesMarciales[i],
        type: ABFItems.COMBAT_TABLE
      });
    } else {
      const arteMarcialSeparada = artesMarciales[i]
        .split('(')
        .map(value => value.trim())
        .filter(element => element !== '');
      const grade = arteMarcialSeparada[1].replace(/[ \)]+/g, '');
      await actor.createInnerItem({
        name: arteMarcialSeparada[0],
        type: ABFItems.MARTIAL_ART,
        system: {
          grade: { value: grade }
        }
      });
    }
  }

  // for (var i = 0; i < tecnicasKi.length; i++) {
  //     await actor.createItem({
  //         name: tecnicasKi[i],
  //         type: ABFItems.TECHNIQUE,
  //         system: INITIAL_TECHNIQUE_DATA
  //     });
  // };

  for (var i = 0; i < invocaciones.length; i++) {
    await actor.createInnerItem({
      name: invocaciones[i],
      type: ABFItems.SUMMON
    });
  }

  for (var i = 0; i < conjurosMantenidos.length; i++) {
    let mantenidoSeparado = conjurosMantenidos[i]
      .split('|')
      .map(value => value.trim())
      .filter(element => element !== '');

    await actor.createInnerItem({
      name: mantenidoSeparado[0],
      type: ABFItems.SPELL_MAINTENANCE,
      system: { cost: { value: mantenidoSeparado[1] } }
    });
  }

  for (var i = 0; i < metamagias.length; i++) {
    let metamagiaSeparada = metamagias[i]
      .split('(')
      .map(value => value.trim())
      .filter(element => element !== '');
    let grade = 0;
    if (metamagiaSeparada.length > 1) {
      grade = metamagiaSeparada[1].replace(/[ \)]+/g, '');
    }
    await actor.createInnerItem({
      name: metamagiaSeparada[0],
      type: ABFItems.METAMAGIC,
      system: { grade: { value: grade } }
    });
  }

  for (var i = 0; i < conjurosSeleccionados.length; i++) {
    let conjuroSeparado = conjurosSeleccionados[i]
      .split('|')
      .map(value => value.trim())
      .filter(element => element !== '');
    let cost = Math.ceil(Number(conjuroSeparado[1]) / 10) * 2;
    await actor.createInnerItem({
      name: conjuroSeparado[0],
      type: ABFItems.SELECTED_SPELL,
      system: { cost: { value: cost } }
    });
  }

  let disciplinesDictionary = {
    Energía: 'energy',
    Causalidad: 'causality',
    Telepatía: 'telepathy',
    Telequinesis: 'telekenisis',
    Teletransporte: 'teleportation',
    Telemetría: 'telemetry',
    Piroquinesis: 'pyrokinesis',
    Crioquinesis: 'cryokinesis',
    'Incremento Físico': 'physicalIncrease',
    Sentiente: 'sentient',
    Electromagnetismo: 'electromagnetism',
    Luz: 'light',
    Hipersensibilidad: 'hypersensitivity'
  };

  for (var i = 0; i < disciplinas_psi.length; i++) {
    let disciplineName = disciplinesDictionary[disciplinas_psi[i]];
    await actor.createItem({
      name: disciplineName,
      type: ABFItems.PSYCHIC_DISCIPLINE,
      system: { imbalance: false }
    });
  }

  let patternsDictionary = {
    Introversión: 'introversion',
    Extroversión: 'extroversion',
    Locura: 'madness',
    Psicopatía: 'psychopath',
    Compasión: 'compassion',
    Cobardía: 'cowardice',
    Valentía: 'courage'
  };

  for (var i = 0; i < patrones_psi.length; i++) {
    let patternName = patternsDictionary[patrones_psi[i]];
    await actor.createItem({
      name: patternName,
      type: ABFItems.MENTAL_PATTERN,
      system: INITIAL_MENTAL_PATTERN_DATA
    });
  }

  actor.prepareData();
  actor.sheet.render(false);
};

function separarHabilidadesKi(habilidades) {
  /** Ensure valid string */
  if (typeof habilidades !== 'string') {
    return {
      habilidadesKi: '',
      habilidadesNemesis: ''
    };
  }

  let result = {
    habilidadesKi: '',
    habilidadesNemesis: ''
  };

  // Remove seals section
  const indexSellos = habilidades.indexOf('Sellos:');
  const habilidadesSinSellos =
    indexSellos !== -1 ? habilidades.slice(0, indexSellos).trim() : habilidades.trim();

  // Split Ki / Némesis by marker
  const indexNemesis = habilidadesSinSellos.indexOf('Uso del Némesis');

  if (indexNemesis === -1) {
    // Only Ki abilities
    result.habilidadesKi = expandAtaqueElemental(habilidadesSinSellos);
    return result;
  }

  const kiPart = habilidadesSinSellos.slice(0, indexNemesis).trim();
  const nemesisPart = habilidadesSinSellos.slice(indexNemesis).trim();

  result.habilidadesKi = expandAtaqueElemental(kiPart);
  result.habilidadesNemesis = nemesisPart;

  return result;
}

function expandAtaqueElemental(text) {
  if (!text) return '';

  return text
    .replace(/Ataque elemental\s*\(([^)]+)\)/gi, (_match, group) => {
      const elements = group
        .split(',')
        .map(e => e.trim())
        .filter(e => e !== '');
      if (!elements.length) return '';
      return elements.map(e => `Ataque elemental: ${e}`).join(', ');
    })
    .replace(/,\s*,/g, ', ') // clean double commas if any
    .replace(/,\s*$/g, '') // remove trailing comma
    .trim();
}

function splitAndRemoveLast(cadena) {
  const partes = cadena.split(' ');
  partes.pop();
  return partes.join(' ').trim();
}

function separarElan(elanesCombinados) {
  let result = [];
  const elanes = elanesCombinados
    .split(')')
    .map(value => value.trim())
    .filter(element => element !== '');
  elanes.forEach(elan => {
    const elanSplitted = elan.split('(');
    const deidad = elanSplitted[0]
      .split(' ')
      .map(value => value.trim())
      .filter(element => element !== '');
    const poderes = elanSplitted[1];
    const nivel = deidad.pop();
    result.push({
      deidad: deidad.join(' ').replace(/, /g, ''),
      nivel: nivel,
      poderes: poderes
        .split(',')
        .map(value => value.trim())
        .filter(element => element !== '')
    });
  });
  return result;
}

function separarNivelDeVia(nivelDeVias) {
  let result = {
    oscuridad: 0,
    luz: 0,
    creacion: 0,
    destruccion: 0,
    agua: 0,
    fuego: 0,
    aire: 0,
    tierra: 0,
    esencia: 0,
    ilusion: 0,
    nigromancia: 0
  };

  nivelDeVias.forEach(nivelDeVia => {
    let nivelDeViaSeparado = nivelDeVia
      .split(' ')
      .map(value => value.trim())
      .filter(element => element !== '');
    if (nivelDeViaSeparado.length >= 2) {
      if (nivelDeVia.includes('Oscuridad')) {
        result.oscuridad = nivelDeViaSeparado[0];
      } else if (nivelDeVia.includes('Luz')) {
        result.luz = nivelDeViaSeparado[0];
      } else if (nivelDeVia.includes('Creación')) {
        result.creacion = nivelDeViaSeparado[0];
      } else if (nivelDeVia.includes('Destrucción')) {
        result.destruccion = nivelDeViaSeparado[0];
      } else if (nivelDeVia.includes('Agua')) {
        result.agua = nivelDeViaSeparado[0];
      } else if (nivelDeVia.includes('Fuego')) {
        result.fuego = nivelDeViaSeparado[0];
      } else if (nivelDeVia.includes('Aire')) {
        result.aire = nivelDeViaSeparado[0];
      } else if (nivelDeVia.includes('Tierra')) {
        result.tierra = nivelDeViaSeparado[0];
      } else if (nivelDeVia.includes('Esencia')) {
        result.esencia = nivelDeViaSeparado[0];
      } else if (nivelDeVia.includes('Ilusión')) {
        result.ilusion = nivelDeViaSeparado[0];
      } else if (nivelDeVia.includes('Nigromancia')) {
        result.nigromancia = nivelDeViaSeparado[0];
      }
    }
  });

  return result;
}

function SetEmptyIfUndefined(data) {
  if (typeof data === 'undefined') {
    return '';
  }
  return data;
}
