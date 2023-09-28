import { calculateAttributeModifier } from '../../util/calculateAttributeModifier';

const mutateResistance = (resistance, presence, attribute) => {

    let baseValue = presence;
    baseValue = presence + calculateAttributeModifier(attribute.value);
    resistance.base.value = baseValue;
    resistance.final.value = baseValue + resistance.special.value;
}

export const mutateResistances = (data) => {
    const presence = data.general.presence.value;

    mutateResistance(data.characteristics.secondaries.resistances.physical, presence, data.characteristics.primaries.constitution);
    mutateResistance(data.characteristics.secondaries.resistances.disease, presence, data.characteristics.primaries.constitution);
    mutateResistance(data.characteristics.secondaries.resistances.poison, presence, data.characteristics.primaries.constitution);
    mutateResistance(data.characteristics.secondaries.resistances.magic, presence, data.characteristics.primaries.power);
    mutateResistance(data.characteristics.secondaries.resistances.psychic, presence, data.characteristics.primaries.willPower);

};