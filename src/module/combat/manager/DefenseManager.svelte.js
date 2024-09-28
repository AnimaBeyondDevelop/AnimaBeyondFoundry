import { ABFSettingsKeys } from '../../../utils/registerSettings';
//Abstract Class, do NOT instanciated
export class DefenseManager {
    data = $state({
        actor: {},
        token: {},
        showRoll: true,
        withRoll: true,
        defense: { base: 0, final: 0 },
    })
    actorSystem = $derived(this.data.actor.system)
    defense = $derived(this.applyModifiers(this.modifiers))
    armor = $derived(this.calculateArmor(this.armorModifiers))

    modifiers = $state({ special: { modifier: 0, active: true } })
    armorModifiers = $state({ special: { modifier: 0, active: true } })

    modifiersTable = {
        fatigue: 15,
        highGround: 20,
        psychicProjection: 10,
        psychicPotential: 20,
        blindness: -80,
        dodgeProjectile: -30,
        parryProjectile: -80,
        shieldParryProjectile: -30,
        maestryParryProjectile: -20,
        parryThrow: -50
    }

    constructor(attacker, defender, hooks, options) {
        this.data.actor = defender.actor
        this.data.token = defender
        this.data.attacker = {
            token: attacker.token,
            attackType: attacker.type,
            critic: attacker.values.critic,
            visible: attacker.values.visible,
            projectile: attacker.values.projectile,
            distance: attacker.values.distance
        }

        this.hooks = hooks

        const showRollByDefault = !!game.settings.get(
            'animabf',
            ABFSettingsKeys.SEND_ROLL_MESSAGES_ON_COMBAT_BY_DEFAULT
        );
        const isGM = !!game.user?.isGM;

        this.data.showRoll = !isGM || showRollByDefault

        let perceiveMystic =
            this.actorSystem.general.settings.perceiveMystic.value;
        let perceivePsychic =
            this.actorSystem.general.settings.perceivePsychic.value;

        if (!this.data.attacker.visible) {
            const { attackType } = this.data.attacker
            if ((!perceiveMystic && !perceivePsychic) ||
                (attackType === 'mystic' && !perceiveMystic) ||
                (attackType === 'psychic' && !perceivePsychic)) {
                this.addModifier("blindness", 1)
            }
        }
    }

    addModifier(modifier, multiplier) {
        if (modifier === "multipleDefensesPenalty") {
            this.modifiers[modifier] = { modifier: multiplier === 0 ? 0 : (-20 * multiplier) - 10, active: true }
        } else {
            this.modifiers[modifier] = { modifier: this.modifiersTable[modifier] * multiplier, active: true }
        }
    }

    removeModifiers(modifiers) {
        for (let mod of modifiers) {
            this.addModifier(mod, 0)
        }
    }

    applyModifiers(modifiers) {
        let totalModifier = 0;
        for (const key in modifiers) {
            totalModifier += this.modifiers[key].modifier;
        }
        return totalModifier
    }

    calculateArmor(armorModifiers) {
        let totalModifier = 0;
        for (const key in armorModifiers) {
            totalModifier += this.armorModifiers[key]?.active ? this.armorModifiers[key].modifier : 0;
        }
        return totalModifier +
            this.actorSystem.combat.totalArmor.at[this.data.attacker.critic]?.value ?? 0
    }
}