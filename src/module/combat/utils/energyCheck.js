import { WeaponCritic } from '../../types/combat/WeaponItemConfig.js';
export const  energyCheck = (critic) => {
    if (critic == WeaponCritic.HEAT ||
        critic == WeaponCritic.ELECTRICITY ||
        critic == WeaponCritic.COLD ||
        critic == WeaponCritic.ENERGY)
    {return true} else {return false}
}