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
    const bonoRF = excelData.RF_final - conResistance;
    const bonoRE = excelData.RE_final - conResistance;
    const bonoRV = excelData.RV_final - conResistance;
    const bonoRM = excelData.RM_final - podResistance;
    const bonoRP = excelData.RP_final - volResistance;

    const habilidades = separarHabilidadesKi(excelData.HabilidadesKiNemesis);
    const habilidadesKi = habilidades[0].split(',').map(value => value.trim()).filter(element => element !== '');
    const habilidadesNem = habilidades[1].split(',').map(value => value.trim()).filter(element => element !== '');
    const arsMagnus = excelData.ArsMagnusSeleccionados.split(',').map(value => value.trim()).filter(element => element !== '');
    const armasConocidas = excelData.Armas_Conocidas.split(',').map(value => value.trim()).filter(element => element !== '');
    const categorias = excelData.CategoríasSeleccionadas.split('/').map(value => value.trim()).filter(element => element !== '');
    const idiomasExtra = excelData.IdiomasExtra.split(',').map(value => value.trim()).filter(element => element !== '');
    const ventajasComunes = excelData.VentajasComunesSeleccionadas.split(',').map(value => value.trim()).filter(element => element !== '');
    const ventajasSobrenaturales = excelData.VentajasSobrenaturalesSeleccionadas.split(',').map(value => value.trim()).filter(element => element !== '');
    const ventajasTrasfondo = excelData.VentajasTrasfondoSeleccionadas.split(',').map(value => value.trim()).filter(element => element !== '');
    const legadosDeSangre = excelData.LegadosSeleccionados.split(',').map(value => value.trim()).filter(element => element !== '');
    const desventajas = excelData.DesventajasSeleccionadas.split(',').map(value => value.trim()).filter(element => element !== '');
    const elan = separarElan(excelData.ElanSeleccionado);
    const aptoParaElDesarrolloDeLaMagia = ventajasSobrenaturales.includes("Apto desarrollo de la magia")

    const selloMaderaMenor = excelData.Sello_Madera_Menor === '1';
    const selloMaderaMayor = excelData.Sello_Madera_Mayor === '1';

    const selloMetalMenor = excelData.Sello_Metal_Menor === '1';
    const selloMetalMayor = excelData.Sello_Metal_Mayor === '1';

    const selloVientoMenor = excelData.Sello_Viento_Menor === '1';
    const selloVientoMayor = excelData.Sello_Viento_Mayor === '1';

    const selloAguaMenor = excelData.Sello_Agua_Menor === '1';
    const selloAguaMayor = excelData.Sello_Agua_Mayor === '1';

    const selloFuegoMenor = excelData.Sello_Fuego_Menor === '1';
    const selloFuegoMayor = excelData.Sello_Fuego_Mayor === '1';

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
                    hair: {
                        value: excelData.Pelo
                    },
                    eyes: {
                        value: excelData.Ojos
                    },
                    height: {
                        value: excelData.Altura + " m"
                    },
                    weight: {
                        value: excelData.Peso + " Kg"
                    },
                    age: {
                        value: excelData.Edad
                    },
                    gender: {
                        value: excelData.Sexo
                    },
                    race: {
                        value: excelData.Raza + " (" + excelData.Nephilim + ")"
                    },
                    ethnicity: {
                        value: excelData.Etnia
                    },
                    appearance: {
                        value: excelData.Apariencia
                    },
                    size: {
                        value: excelData.Tamaño
                    },

                },
                languages: {
                    base: {
                        value: excelData.IdiomaBase
                    },
                    others: []
                },
                levels: [],
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
                arsMagnus: [],
                seals: {
                    minor: {
                        earth: {
                            isActive: {
                                value: true
                            } 
                        },
                        metal: {
                            isActive: excelData.Sello_Metal_Menor === '1'
                        },
                        wind: {
                            isActive: excelData.Sello_Viento_Menor === '1'
                        },
                        water: {
                            isActive: excelData.Sello_Agua_Menor === '1'
                        },
                        wood: {
                            isActive: excelData.Sello_Fuego_Menor === '1'
                        }
                    },
                    major: {
                        earth: {
                            isActive: excelData.Sello_Madera_Mayor === '1'
                        },
                        metal: {
                            isActive: excelData.Sello_Metal_Mayor === '1'
                        },
                        wind: {
                            isActive: excelData.Sello_Viento_Mayor === '1'
                        },
                        water: {
                            isActive: excelData.Sello_Agua_Mayor === '1'
                        },
                        wood: {
                            isActive: excelData.Sello_Fuego_Mayor === '1'
                        }
                    }
                }
            }
        }
    });

    //Settear habilidades del Ki
    for (var i = 0; i < habilidadesKi.length; i++) {
        let abilityName = habilidadesKi[i];
        if (abilityName.indexOf("Detección del Ki") !== -1) {
            abilityName = splitAndRemoveLast(habilidadesKi[i]);
        }
        if (abilityName.indexOf("Ataque elemental") !== -1) {
            const ataqueElementalSeparado = habilidadesKi[i].split('(');
            ataqueElementalSeparado.pop();
            abilityName = ataqueElementalSeparado;
        }
        await actor.createInnerItem({
            name: abilityName,
            type: ABFItems.KI_SKILL
        });
    };

    //Settear habilidades del némesis
    for (var i = 0; i < habilidadesNem.length; i++) {
        await actor.createInnerItem({
            name: habilidadesNem[i],
            type: ABFItems.NEMESIS_SKILL
        });
    };

    //Settear ars magnus
    for (var i = 0; i < arsMagnus.length; i++) {
        await actor.createInnerItem({
            name: arsMagnus[i],
            type: ABFItems.ARS_MAGNUS
        });
    };

    for (var i = 0; i < categorias.length; i++) {
        let categorySubstrings = categorias[i].split(' ').map(value => value.trim()).filter(element => element !== '');


        if (isNaN(Number(categorySubstrings[categorySubstrings.length - 1]))) {
            await actor.createInnerItem({
                name: categorias[i],
                type: ABFItems.LEVEL,
                system: { level: excelData.Nivel_Total }
            });
        }
        else {
            let level = categorySubstrings.pop();
            await actor.createInnerItem({
                name: categorySubstrings.join(' '),
                type: ABFItems.LEVEL,
                system: { level: level }
            });
        }
    };

    for (var i = 0; i < idiomasExtra.length; i++) {
        await actor.createInnerItem({
            name: idiomasExtra[i],
            type: ABFItems.LANGUAGE
        });
    };



    for (var i = 0; i < ventajasComunes.length; i++) {
        await actor.createItem({
            name: ventajasComunes[i],
            type: ABFItems.ADVANTAGE
        });
    };

    for (var i = 0; i < ventajasSobrenaturales.length; i++) {
        await actor.createItem({
            name: ventajasSobrenaturales[i],
            type: ABFItems.ADVANTAGE
        });
    };

    for (var i = 0; i < ventajasTrasfondo.length; i++) {
        await actor.createItem({
            name: ventajasTrasfondo[i],
            type: ABFItems.ADVANTAGE
        });
    };

    for (var i = 0; i < legadosDeSangre.length; i++) {
        await actor.createItem({
            name: legadosDeSangre[i],
            type: ABFItems.ADVANTAGE
        });
    };

    for (var i = 0; i < desventajas.length; i++) {
        await actor.createItem({
            name: desventajas[i],
            type: ABFItems.DISADVANTAGE
        });
    };

    for (var i = 0; i < elan.length; i++) {
        await actor.createInnerItem({
            name: elan[i].deidad,
            type: ABFItems.ELAN,
            system: {
                level: { value: elan[i].nivel },
                powers: []
            }
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

function separarElan(elanesCombinados) {
    let result = []
    const elanes = elanesCombinados.split(')').map(value => value.trim()).filter(element => element !== '');
    elanes.forEach(elan => {
        const elanSplitted = elan.split('(');
        const deidad = elanSplitted[0].split(' ').map(value => value.trim()).filter(element => element !== '');
        const poderes = elanSplitted[1];
        const nivel = deidad.pop();
        result.push({
            deidad: deidad.join(' ').replace(/, /g, ''),
            nivel: nivel,
            poderes: poderes.split(',').map(value => value.trim()).filter(element => element !== '')
        });
    });
    return result;
}