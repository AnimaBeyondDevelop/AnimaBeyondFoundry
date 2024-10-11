import { resistanceEffectCheck } from '@module/combat/utils/resistanceEffectCheck.js';
import { AttackManager } from '@module/combat/manager/AttackManager.svelte.js'
import { rollToMessageFlavor } from '@module/combat/utils/rollToMessageFlavor.js'
import { damageCheck } from '@module/combat/utils/damageCheck.js';
import ABFFoundryRoll from '@module/rolls/ABFFoundryRoll';

export class PsychicAttackManager extends AttackManager {
    power = $derived(this.getPower(this.data.powerUsed));
    psychicPotential = $derived(this.applyPotentialModifiers(this.potentialModifiers))

    potentialModifiers = $state({ special: { modifier: 0, active: true } })

    constructor(attacker, defender, hooks, options) {
        super(attacker, defender, hooks, options);

        this.data.attack = {
            base: this.actorSystem.psychic.psychicProjection.imbalance.offensive.base.value,
            final: this.actorSystem.psychic.psychicProjection.imbalance.offensive.final.value
        }
        this.data.psychicPotential = this.actorSystem.psychic.psychicPotential.final.value
        this.data.psychicPotentialRoll = undefined
        this.data.psychicFatigue = 0

        this.data.psychicPoints = { usedProjection: 0, usedPotential: 0, eliminateFatigue: 0, available: this.actorSystem.psychic.psychicPoints.value }

        this.data.psychicPowers = this.actorSystem.psychic.psychicPowers.filter(w => w.system.combatType.value === 'attack')

        const lastOffensivePowerUsed = this.data.actor.getFlag(
            'animabf',
            'lastOffensivePowerUsed'
        )
        if (this.data.psychicPowers.find(w => w.id === lastOffensivePowerUsed)) {
            this.data.powerUsed = lastOffensivePowerUsed
        } else {
            this.data.powerUsed = this.data.psychicPowers[0]?._id
        }
        this.data.powerUsedEffect = ''
        this.data.eliminateFatigue = false
        this.data.mentalPatternImbalance = false

        this.data.projectile.value = true
        this.data.projectile.type = 'shot'

        this.onPowerChange()
    }

    addPotentialModifier(modifier, multiplier) {
        this.potentialModifiers[modifier] = { modifier: this.modifiersTable[modifier] * multiplier, active: true }
    }

    applyModifiers(modifiers) {
        let totalModifier = super.applyModifiers(modifiers);

        return totalModifier + this.data.attack.final
    }

    applyPotentialModifiers(potentialModifiers) {
        let totalModifier = 0;
        for (const key in potentialModifiers) {
            totalModifier += this.potentialModifiers[key]?.active ? this.potentialModifiers[key].modifier : 0;
        }
        return totalModifier + this.data.psychicPotential
    }

    calculateDamage(damageModifiers) {
        let totalModifier = super.calculateDamage(damageModifiers);

        return damageCheck(this.data.powerUsedEffect) + totalModifier
    }

    getPower(powerUsed) {
        if (powerUsed) {
            return this.data.psychicPowers.find(w => w.id === powerUsed)
        }
        return undefined
    }

    onPowerChange() {
        this.data.critics = {
            selected: this.power?.system.critic.value === '-' ? 'none' : this.power?.system.critic.value ?? 'none',
            primary: this.power?.system.critic.value === '-' ? 'none' : this.power?.system.critic.value ?? 'none',
            secondary: 'none'
        }
        this.data.visible = this.power?.system.visible
    }

    usePsychicPoints(usedPoints, type) {
        switch (type) {
            case "psychicProjection":
                this.addModifier(type, usedPoints)
                break
            case "psychicPotential":
                this.addPotentialModifier(type, usedPoints)
                break
            case "eliminateFatigue":
                this.data.psychicPoints.eliminateFatigue = usedPoints
                break
        }
    }

    async onPsychicPotential() {
        const { i18n } = game;

        const psychicPotentialRoll = new ABFFoundryRoll(
            `1d100PsychicRoll + ${this.psychicPotential}`,
            { ...this.actorSystem, power: this.power, mentalPatternImbalance: this.data.mentalPatternImbalance }
        );
        await psychicPotentialRoll.roll();

        this.data.psychicPotentialRoll = psychicPotentialRoll.total

        if (this.data.showRoll) {
            psychicPotentialRoll.toMessage({
                speaker: ChatMessage.getSpeaker({ token: this.data.token }),
                flavor: i18n.format('macros.combat.dialog.psychicPotential.title')
            });
        }

        this.data.psychicFatigue = await this.data.actor.evaluatePsychicFatigue(
            this.power,
            psychicPotentialRoll.total,
            this.data.eliminateFatigue,
            this.data.showRoll
        );

        this.data.powerUsedEffect = this.power?.system.effects[psychicPotentialRoll.total].value;
        this.data.resistanceEffect = resistanceEffectCheck(this.data.powerUsedEffect);
    }

    async onAttack() {
        const { i18n } = game;
        this.data.actor.setFlag('animabf', 'lastOffensivePowerUsed', this.data.powerUsed)

        let formula = `1d100xa + ${this.attack}`;
        if (!this.data.withRoll) {
            // Remove the dice from the formula
            formula = formula.replace('1d100xa', '0');
        }
        if (this.data.attack.base >= 200) {
            // Mastery reduces the fumble range
            formula = formula.replace('xa', 'xamastery');
        }

        const psychicProjectionRoll = new ABFFoundryRoll(formula, this.actorSystem);

        await psychicProjectionRoll.roll();

        if (this.data.showRoll && !this.data.psychicFatigue) {
            const projectionFlavor = i18n.format(
                'macros.combat.dialog.psychicAttack.title',
                {
                    power: this.power.name,
                    potential: this.data.psychicPotentialRoll,
                    target: this.data.defenderToken.name
                }
            );
            psychicProjectionRoll.toMessage({
                speaker: ChatMessage.getSpeaker({ token: this.data.token }),
                flavor: rollToMessageFlavor(projectionFlavor, psychicProjectionRoll)
            });
        }

        const rolled = psychicProjectionRoll.total - this.attack;

        this.hooks.onAttack({
            type: 'psychic',
            values: {
                power: this.power,
                psychicPotential: this.data.psychicPotentialRoll,
                psychicProjection: this.attack,
                psychicFatigue: this.data.psychicFatigue,
                damage: this.damage,
                critic: this.data.critics.selected,
                roll: rolled,
                total: psychicProjectionRoll.total,
                fumble: psychicProjectionRoll.fumbled,
                resistanceEffect: this.data.resistanceEffect,
                visible: this.data.visible,
                projectile: this.data.projectile,
                distance: this.data.distance,
                attackerCombatMod: this.modifiers //rev hace falta agregar damageModifiers? prob si
            }
        });
    }
}