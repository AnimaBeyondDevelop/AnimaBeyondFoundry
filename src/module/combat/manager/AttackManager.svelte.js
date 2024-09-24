import { ABFSettingsKeys } from '../../../utils/registerSettings';
//Abstract Class, do NOT instanciated
export class AttackManager {
    data = $state({
        actor: {},
        token: {},
        system: {},
        showRoll: true,
        withRoll: true,
        counterAttackBonus: 0,
        attack: { base: 0, final: 0 },
        critics: {
            selected: 'impact',
            primary: 'impact',
            secondary: "none"
        },
        resistanceEffect: { value: 0, type: undefined, check: false },
        visible: true,
        projectile: {
            value: false,
            type: ''
        },
        distance: {
            value: 0,
            enable: false,
            pointBlank: false
        }
    })
    attack = $derived(this.applyModifiers(this.modifiers))
    damage = $derived(this.calculateDamage(this.damageModifiers))

    modifiers = $state({ special: { modifier: 0, active: true } })
    damageModifiers = $state({ special: { modifier: 0, active: true } })

    modifiersTable = {
        fatigue: 15,
        highGround: 20,
        poorVisibility: -20,
        targetInCover: - 40,
        pointBlank: 30,
        secondaryCritic: - 10,
        psychicProjection: 10,
        psychicPotential: 20
    }

    constructor(attacker, defender, hooks, options) {
        this.data.actor = attacker.actor
        this.data.token = attacker
        this.data.system = this.data.actor.system // No es reactivo. tampoco funciona inicializando como attacker.actor.system
        this.data.defenderToken = defender

        this.hooks = hooks

        if (options?.counterAttackBonus) {
            this.modifiers.counterAttackBonus = { modifier: options?.counterAttackBonus, active: true }
        }

        const showRollByDefault = !!game.settings.get(
            'animabf',
            ABFSettingsKeys.SEND_ROLL_MESSAGES_ON_COMBAT_BY_DEFAULT
        );
        const isGM = !!game.user?.isGM;

        this.data.showRoll = !isGM || showRollByDefault

        const combatDistance = !!game.settings.get(
            'animabf',
            ABFSettingsKeys.AUTOMATE_COMBAT_DISTANCE
        );

        this.data.distance.enable = combatDistance

        if (combatDistance) {
            let calculateDistance =
                canvas.grid.measureDistance(
                    this.data.token,
                    this.data.defenderToken,
                    { gridSpaces: true }
                );
            this.data.distance.value = calculateDistance;
            this.data.distance.pointBlank = (calculateDistance /
                canvas.dimensions.distance) <= 1
        }
    }

    addModfier(modifier, multiplier) {
        this.modifiers[modifier] = { modifier: this.modifiersTable[modifier] * multiplier, active: true }
    }

    applyModifiers(modifiers) {
        let totalModifier = 0;
        for (const key in modifiers) {
            totalModifier += this.modifiers[key].modifier;
        }
        return totalModifier
    }

    calculateDamage(damageModifiers) {
        let totalModifier = 0;
        for (const key in damageModifiers) {
            totalModifier += this.damageModifiers[key]?.active ? this.damageModifiers[key].modifier : 0;
        }
        return totalModifier
    }
}