import { calculateAttributeModifier } from '../util/calculateAttributeModifier.js';

const mutateResistance = (resistance, presence, attribute) => {
    let baseValue = presence;
    baseValue = presence + calculateAttributeModifier(attribute.value);
    resistance.base.value = baseValue;
    resistance.final.value = baseValue + resistance.special.value;
};

/**
 * Adds to primary characteristics object without modifiers its modifiers,
 * calculated based on its value
 * @param {import('../../../../../types/Actor').ABFActorDataSourceData} data
 */
export const mutateResistances = (data) => {
    const presence = data.general.presence.final.value;
    mutateResistance(data.characteristics.secondaries.resistances.physical, presence, data.characteristics.primaries.constitution);
    mutateResistance(data.characteristics.secondaries.resistances.disease, presence, data.characteristics.primaries.constitution);
    mutateResistance(data.characteristics.secondaries.resistances.poison, presence, data.characteristics.primaries.constitution);
    mutateResistance(data.characteristics.secondaries.resistances.magic, presence, data.characteristics.primaries.power);
    mutateResistance(data.characteristics.secondaries.resistances.psychic, presence, data.characteristics.primaries.willPower);
};