import { DefenseManager } from '@module/combat/manager/DefenseManager.svelte.js'
import { rollToMessageFlavor } from '@module/combat/utils/rollToMessageFlavor.js'
import ABFFoundryRoll from '@module/rolls/ABFFoundryRoll';

export class PsychicDefenseManager extends DefenseManager {
    power = $derived(this.getPower(this.data.powerUsed, this.data.newShield));
    psychicPotential = $derived(this.applyPotentialModifiers(this.potentialModifiers))

    potentialModifiers = $state({ special: { modifier: 0, active: true } })

    constructor(attacker, defender, hooks, options) {
        super(attacker, defender, hooks, options);

        this.data.defense = {
            base: this.actorSystem.psychic.psychicProjection.imbalance.defensive.base.value,
            final: this.actorSystem.psychic.psychicProjection.imbalance.defensive.final.value
        }
        this.data.psychicPotential = this.actorSystem.psychic.psychicPotential.final.value

        this.data.psychicPoints = { usedProjection: 0, usedPotential: 0, eliminateFatigue: 0, available: this.actorSystem.psychic.psychicPoints.value }

        this.data.psychicPowers = this.actorSystem.psychic.psychicPowers.filter(w => w.system.combatType.value === 'defense')

        const lastDefensivePowerUsed = this.data.actor.getFlag(
            'animabf',
            'lastDefensivePowerUsed'
        )
        if (this.data.psychicPowers.find(w => w.id === lastDefensivePowerUsed)) {
            this.data.powerUsed = lastDefensivePowerUsed
        } else {
            this.data.powerUsed = this.data.psychicPowers[0]?._id
        }

        this.data.eliminateFatigue = false
        this.data.mentalPatternImbalance = false

        this.data.supernaturalShields = this.actorSystem.combat.supernaturalShields
        this.data.newShield = this.data.supernaturalShields.length === 0
        this.data.shieldPoints = 0

        this.onNewShield(this.data.newShield)
    }

    addPotentialModifier(modifier, multiplier) {
        this.potentialModifiers[modifier] = { modifier: this.modifiersTable[modifier] * multiplier, active: true }
    }

    applyModifiers(modifiers) {
        let totalModifier = super.applyModifiers(modifiers);

        return totalModifier + this.data.defense.final
    }

    applyPotentialModifiers(potentialModifiers) {
        let totalModifier = 0;
        for (const key in potentialModifiers) {
            totalModifier += this.potentialModifiers[key]?.active ? this.potentialModifiers[key].modifier : 0;
        }
        return totalModifier + this.data.psychicPotential
    }

    getPower(powerUsed, newShield) {
        if (powerUsed) {
            return this.data[newShield ? "psychicPowers" : "supernaturalShields"].find(w => w.id === powerUsed)
        }
        return undefined
    }

    onPowerChange() {
        this.data.shieldPoints = this.data.newShield ? 0 : this.power.system.shieldPoints
    }

    onNewShield(newShield) {
        this.data.powerUsed = this.data[newShield ? "psychicPowers" : "supernaturalShields"][0]?.id
        this.onPowerChange()

        if (!newShield) {
            this.data.eliminateFatigue = false
            this.data.mentalPatternImbalance = false
            this.data.psychicPoints.usedPotential = 0
            this.usePsychicPoints(0, "psychicPotential")
            this.usePsychicPoints(0, "eliminateFatigue")
        }
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

    async onDefense() {
        console.log(this)
        const { i18n } = game;
        this.data.actor.setFlag('animabf', 'lastDefensivePowerUsed', this.data.powerUsed)

        let formula = `1d100xa + ${this.defense}`;
        if (!this.data.withRoll) {
            // Remove the dice from the formula
            formula = formula.replace('1d100xa', '0');
        }
        if (this.data.defense.base >= 200) {
            // Mastery reduces the fumble range
            formula = formula.replace('xa', 'xamastery');
        }

        const psychicProjectionRoll = new ABFFoundryRoll(formula, this.actorSystem);

        await psychicProjectionRoll.roll();

        let psychicFatigue = 0;
        let psychicPotentialRoll;

        if (this.data.newShield && this.data.powerUsed) {
            this.data.actor.setFlag('animabf', 'lastDefensivePowerUsed', this.data.powerUsed);

            psychicPotentialRoll = new ABFFoundryRoll(
                `1d100PsychicRoll + ${this.psychicPotential}`,
                { ...this.actorSystem, power: this.power, mentalPatternImbalance: this.data.mentalPatternImbalance }
            );
            await psychicPotentialRoll.roll();

            if (this.data.showRoll) {
                psychicPotentialRoll.toMessage({
                    speaker: ChatMessage.getSpeaker({ token: this.data.token }),
                    flavor: i18n.format('macros.combat.dialog.psychicPotential.title')
                });
            }
            // Evaluate psychic fatigue
            psychicFatigue = await this.data.actor.evaluatePsychicFatigue(
                this.power,
                psychicPotentialRoll.total,
                this.data.eliminateFatigue,
                this.data.showRoll
            );
        }

        let supShield = { create: this.data.newShield && !psychicFatigue, id: this.data.powerUsed };
        // If no psychic fatigue, show defense roll message
        if (!psychicFatigue && this.data.showRoll) {
            const projectionFlavor = i18n.format(
                'macros.combat.dialog.psychicDefense.title',
                {
                    power: rollToMessageFlavor(this.power.name, psychicProjectionRoll),
                    target: this.data.attacker.token.name
                }
            );
            psychicProjectionRoll.toMessage({
                speaker: ChatMessage.getSpeaker({ token: this.data.token }),
                flavor: projectionFlavor
            });
        }

        const rolled = psychicProjectionRoll.total - this.defense;

        this.hooks.onDefense({
            type: 'psychic',
            values: {
                powerUsed: this.data.powerUsed,
                powerName: this.power.name,
                psychicPotential: psychicPotentialRoll?.total ?? 0,
                psychicProjection: this.defense,
                psychicFatigue,
                at: this.armor,
                roll: rolled,
                total: psychicProjectionRoll.total,
                fumble: psychicProjectionRoll.fumbled,
                supShield,
                defenderCombatMod: this.modifiers //rev hace falta agregar damageModifiers? prob si
            }
        });
    }
}