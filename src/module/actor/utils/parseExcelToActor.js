import { ABFActor } from '../ABFActor';
import { ABFItems } from '../../items/ABFItems';
import { calculateRegenerationTypeFromConstitution } from './prepareActor/calculations/actor/general/calculations/calculateRegenerationTypeFromConstitution';
import { calculateAttributeModifier } from './prepareActor/calculations/util/calculateAttributeModifier';

  /**
   * Parses excel data to actor data
   *
   * @param {any} excelData - provided exel data
   * @param {ABFActor} actor - provided Actor to update
   */
  export const parseExcelToActor = async (excelData, actor) => {
    console.log(actor);

    const movementModifier = excelData.TipodeMovimiento - excelData.AGI;
    const regenerationModifier = excelData.Regeneración_final - calculateRegenerationTypeFromConstitution(excelData.CON);
    const extraDamage = (excelData.DañoIncrementado ? 10 : 0) + (excelData.Extensióndelauraalarma ? 10 : 0);
    const conResistance = excelData.Presencia_final + calculateAttributeModifier(excelData.CON);
    const podResistance = excelData.Presencia_final + calculateAttributeModifier(excelData.POD);
    const volResistance = excelData.Presencia_final + calculateAttributeModifier(excelData.VOL);

    //Esto es para cuando esté la automatización de las resistencias
    const bonoRF = excelData.RF_final-conResistance;
    const bonoRE = excelData.RE_final-conResistance;
    const bonoRV = excelData.RV_final-conResistance;
    const bonoRM = excelData.RM_final-podResistance;
    const bonoRP = excelData.RP_final-volResistance;
    
    
    console.log(excelData);

    await actor.update({
        name: excelData.Nombre,
        prototypeToken: {
            name: excelData.Nombre
        },
        system: {
            characteristics: {
                primaries: {
                    agility: {
                        value: excelData.AGI
                    },
                    constitution: {
                        value: excelData.CON
                    },
                    dexterity: {
                        value: excelData.DES
                    },
                    strength: {
                        value: excelData.FUE
                    },
                    intelligence: {
                        value: excelData.INT
                    },
                    power: {
                        value: excelData.POD
                    },
                    perception: {
                        value: excelData.PER
                    },
                    willPower: {
                        value: excelData.VOL
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
                            base: {
                                value: excelData.RF_final
                            }
                        },
                        disease: {
                            base: {
                                value: excelData.RE_final
                            }
                        },
                        poison: {
                            base: {
                                value: excelData.RV_final
                            }
                        },
                        magic: {
                            base: {
                                value: excelData.RM_final
                            }
                        },
                        psychic: {
                            base: {
                                value: excelData.RP_final
                            }
                        }
                    }
                }
            },
            combat: {
                attack: {
                    base: {
                        value: excelData.HA_final
                    }
                },
                block: {
                    base: {
                        value: excelData.HD_final
                    }
                },
                dodge: {
                    base: {
                        value: excelData.HE_final
                    }
                },
                wearArmor: {
                    value: excelData.LlevarArmadura_final
                }
            },
            general: {
                presence: {
                    base: {
                        value: excelData.Presencia_final
                    }
                },
                modifiers: {
                    extraDamage: {
                        value: extraDamage
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
                    hair:{
                        value: excelData.Pelo
                    },
                    eyes:{
                        value: excelData.Ojos
                    },
                    height:{
                        value: excelData.Altura + " m"
                    },
                    weight:{
                        value: excelData.Peso + " Kg"
                    },
                    age:{
                        value: excelData.Edad
                    },
                    gender:{
                        value: excelData.Sexo
                    },
                    race:{
                        value: excelData.Raza + " (" + excelData.Nephilim + ")"
                    },
                    ethnicity:{
                        value: excelData.Etnia
                    },
                    appearance:{
                        value: excelData.Apariencia
                    },
                    size:{
                        value: excelData.Tamaño
                    },
                    
                },
                languages: {
                    base: {
                        value: excelData.IdiomaBase
                    },
                    others: []
                },
                levels: []
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
                }
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
                            value: excelData["P.Fuerza_final"]
                        }
                    },
                    withstandPain: {
                        base: { 
                            value: excelData["Res.Dolor_final"]
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
                            value: excelData["V.Mágica_final"]
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
                            value: excelData["T.Manos_final"]
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
                            value: excelData["Conf.marionetas_final"]
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
                arsMagnus: []
            }
        }
    });

    const habilidades = separarHabilidadesKi(excelData.HabilidadesKiNemesis);
    console.log(habilidades[0]);
    console.log(habilidades[1]);
    const habilidadesKi = habilidades[0].split(',').map(value => value.trim()).filter(element => element !== '');
    const habilidadesNem = habilidades[1].split(',').map(value => value.trim()).filter(element => element !== '');
    console.log(habilidadesKi);
    console.log(habilidadesNem);
    for (var i = 0; i < habilidadesKi.length; i++) {
        let abilityName = habilidadesKi[i];
        if(abilityName.indexOf("Detección del Ki") !== -1)
        {
            abilityName = splitAndRemoveLast(habilidadesKi[i]);
        }
        await actor.createInnerItem({
            name: abilityName,
            type: ABFItems.KI_SKILL
          });
      };
    for (var i = 0; i < habilidadesNem.length; i++) {
        await actor.createInnerItem({
            name: habilidadesNem[i],
            type: ABFItems.NEMESIS_SKILL
          });
      };

    const arsMagnus = excelData.ArsMagnusSeleccionados.split(',').map(value => value.trim()).filter(element => element !== '');
    console.log(arsMagnus);
    for (var i = 0; i < arsMagnus.length; i++) {
        await actor.createInnerItem({
            name: arsMagnus[i],
            type: ABFItems.ARS_MAGNUS
          });
      };

      const armasConocidas = excelData.Armas_Conocidas.split(',').map(value => value.trim()).filter(element => element !== '');
      console.log(armasConocidas);
      //console.log(excelData.CategoríasSeleccionadas);
      const categorias = excelData.CategoríasSeleccionadas.split('/').map(value => value.trim()).filter(element => element !== '');
      console.log(categorias);
      for (var i = 0; i < categorias.length; i++) {
        let categorySubstrings = categorias[i].split(' ').map(value => value.trim()).filter(element => element !== '');
        
        
            if (isNaN(Number(categorySubstrings[categorySubstrings.length-1]))) {
                await actor.createInnerItem({
                    name: categorias[i],
                    type: ABFItems.LEVEL,
                    system: { level: excelData.Nivel_Total } 
                  });
            }
            else{
                let level = categorySubstrings.pop();
                await actor.createInnerItem({
                    name: categorySubstrings.join(' '),
                    type: ABFItems.LEVEL,
                    system: { level: level } 
                  });
            }
      };

      const idiomasExtra = excelData.IdiomasExtra.split(',').map(value => value.trim()).filter(element => element !== '');
      console.log(idiomasExtra);
      for (var i = 0; i < idiomasExtra.length; i++) {
        await actor.createInnerItem({
            name: idiomasExtra[i],
            type: ABFItems.LANGUAGE
          });
      };
  }

  function separarHabilidadesKi(habilidades) {
    const índice = habilidades.indexOf("Uso del Némesis");

    if (índice === -1) {
        return [habilidades, ""];
    }

    const habilidadesKi = habilidades.slice(0, índice).trim();
    const habilidadesNem = habilidades.slice(índice).trim();

    return [habilidadesKi, habilidadesNem];
}

function splitAndRemoveLast(cadena) {
    const partes = cadena.split(' ');
    partes.pop();
    return partes.join(' ').trim();
}


