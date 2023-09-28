export const  shieldSupernaturalCheck = (name, specialType) => {
    const shieldSpecialType = [{ 
        name: 'Escudo de Hielo',
        material: true,
        inmaterial: false,
        intangible: false,
        energy: true,
        materialEnergy: true,
        attackSpellLight: true,
        attackSpellDarkness: true
    },{ 
        name: 'Escudo Telequinético',
        material: true,
        inmaterial: false,
        intangible: false,
        energy: true,
        materialEnergy: true,
        attackSpellLight: false,
        attackSpellDarkness: false
    },{ 
        name: '30 - Escudo Magnético',
        material: true,
        inmaterial: false,
        intangible: false,
        energy: true,
        materialEnergy: true,
        attackSpellLight: false,
        attackSpellDarkness: false
    }];
    const shield = shieldSpecialType.filter(e => e.name == name)
    if (name == '10 - Escudo de Luz'){
        if(specialType == 'attackSpellDarkness') { return [false, true, false] }
        if(specialType == 'material') { return [false, false, true] }
        else { return [false, false, false] }
    }
    else if  (name == '10 - Escudo Oscuro'){
        if(specialType == 'attackSpellLight') { return [false, true, false] }
        if(specialType == 'material') { return [false, false, true] }
        else { return [false, false, false] }
    }
    else if (shield.length !== 0 && !shield[0][specialType]) { return [true, false, false] }
    else { return [false, false, false] }
}