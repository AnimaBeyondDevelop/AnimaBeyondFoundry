import { DefenseManager } from '@module/combat/manager/DefenseManager.svelte.js'
import { rollToMessageFlavor } from '@module/combat/utils/rollToMessageFlavor.js'
import { shieldValueCheck } from '@module/combat/utils/shieldValueCheck.js';
import ABFFoundryRoll from '@module/rolls/ABFFoundryRoll';

export class MysticDefenseManager extends DefenseManager {
    spell = $derived(this.getSpell(this.data.spellUsed, this.data.newShield));
    shieldPoints = $derived(this.getShieldPoints(this.data.spellUsed, this.data.spellGrade, this.data.newShield));
    castMethod = $state("accumulated")
    spellCasting = $derived(
        this.data.actor.mysticCanCastEvaluate(
            this.spell,
            this.data.spellGrade,
            {
                prepared: this.castMethod == "prepared",
                innate: this.castMethod == "innate"
            },
            this.castMethod == "override" || !this.data.newShield
        )
    )
    attainableSpellGrades = $derived(this.getAttainableSpellGrades(this.data.spellUsed, this.castMethod));

    constructor(attacker, defender, hooks, options) {
        super(attacker, defender, hooks, options);

        this.data.defense = {
            base: this.actorSystem.mystic.magicProjection.imbalance.defensive.base.value,
            final: this.actorSystem.mystic.magicProjection.imbalance.defensive.final.value
        }
        this.data.spells = this.actorSystem.mystic.spells.filter(w => w.system.combatType.value === 'defense')

        const lastDefensiveSpellUsed = this.data.actor.getFlag(
            'animabf',
            'lastDefensiveSpellUsed'
        )
        if (this.data.spells.find(w => w.id === lastDefensiveSpellUsed)) {
            this.data.spellUsed = lastDefensiveSpellUsed
        } else {
            this.data.spellUsed = this.data.spells[0]?.id
        }

        const spellCastingOverride = this.data.actor.getFlag(
            'animabf',
            'spellCastingOverride'
        );

        this.castMethod = spellCastingOverride ? "override" : "accumulated"

        this.data.spellGrade = 'base'

        this.data.supernaturalShields = this.actorSystem.combat.supernaturalShields
        this.data.newShield = this.data.supernaturalShields.length === 0

        this.onNewShield(this.data.newShield)
    }

    applyModifiers(modifiers) {
        let totalModifier = super.applyModifiers(modifiers);

        return totalModifier + this.data.defense.final
    }

    getAttainableSpellGrades(spellUsed, castMethod) {
        if (castMethod === "override" || !this.data.newShield) {
            return ['base', 'intermediate', 'advanced', 'arcane']
        } else {
            let attainableSpellGrades = []
            let intelligence = this.actorSystem.characteristics.primaries.intelligence.value
            let finalIntelligence = this.actorSystem.mystic.mysticSettings.aptitudeForMagicDevelopment ? intelligence + 3 : intelligence
            for (let grade in this.spell?.system.grades) {
                if (finalIntelligence >= this.spell?.system.grades[grade].intRequired.value) {
                    attainableSpellGrades.push(grade)
                }
            }
            return attainableSpellGrades
        }
    }

    getSpell(spellUsed, newShield) {
        if (spellUsed) {
            return this.data[newShield ? "spells" : "supernaturalShields"].find(w => w.id === spellUsed)
        }
        return undefined
    }

    onSpellChange() {
        this.data.spellGrade = 'base'
        this.getAttainableSpellGrades()
    }

    getShieldPoints(spellUsed, spellGrade, newShield) {
        if (newShield) {
            return shieldValueCheck(
                this.spell?.system.grades[spellGrade].description.value ?? ''
            )
        }
        return this.spell?.system.shieldPoints
    }

    onNewShield(newShield) {
        this.data.spellUsed = this.data[newShield ? "spells" : "supernaturalShields"][0]?.id
        this.onSpellChange()
    }

    async onDefense() {
        if (this.data.newShield && this.data.spellUsed) {
            this.data.actor.setFlag('animabf', 'spellCastingOverride', this.castMethod === "override");
            this.data.actor.setFlag('animabf', 'lastDefensiveSpellUsed', this.data.spellUsed)
            if (this.data.actor.evaluateCast(this.spellCasting)) {
                this.castMethod = "override";
                return;
            }
        }

        let supShield = { create: this.data.newShield, id: this.data.spellUsed };

        let formula = `1d100xa + ${this.defense}`;
        if (!this.data.withRoll) {
            // Remove the dice from the formula
            formula = formula.replace('1d100xa', '0');
        }
        if (this.data.defense.base >= 200) {
            // Mastery reduces the fumble range
            formula = formula.replace('xa', 'xamastery');
        }

        const roll = new ABFFoundryRoll(formula, this.actorSystem);

        await roll.roll();

        if (this.data.showRoll) {
            const { i18n } = game;

            const flavor = i18n.format('macros.combat.dialog.magicDefense.title', {
                spell: this.spell?.name,
                target: this.data.attacker.token.name
            })

            roll.toMessage({
                speaker: ChatMessage.getSpeaker({ token: this.data.token }),
                flavor: rollToMessageFlavor(flavor, roll)
            });
        }

        const rolled = roll.total - this.defense;

        this.hooks.onDefense({
            type: 'mystic',
            values: {
                spell: this.data.spell,
                spellGrade: this.data.spellGrade,
                magicProjection: this.defense,
                spellCasting: this.spellCasting,
                roll: rolled,
                total: roll.total,
                fumble: roll.fumbled,
                supShield,
                defenderCombatMod: this.modifiers
            }
        });
    }
}