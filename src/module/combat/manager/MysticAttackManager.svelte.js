import { resistanceEffectCheck } from '@module/combat/utils/resistanceEffectCheck.js';
import { AttackManager } from '@module/combat/manager/AttackManager.svelte.js'
import { rollToMessageFlavor } from '@module/combat/utils/rollToMessageFlavor.js'
import { damageCheck } from '@module/combat/utils/damageCheck.js';
import ABFFoundryRoll from '@module/rolls/ABFFoundryRoll';

export class MysticAttackManager extends AttackManager {
    spell = $derived(this.getSpell(this.data.spellUsed));
    castMethod = $state("accumulated")
    spellCasting = $derived(
        this.data.actor.mysticCanCastEvaluate(
            this.spell,
            this.data.spellGrade,
            {
                prepared: this.castMethod == "prepared",
                innate: this.castMethod == "innate"
            },
            this.castMethod == "override"
        )
    )
    attainableSpellGrades = $derived(this.getAttainableSpellGrades(this.data.spellUsed, this.castMethod));

    constructor(attacker, defender, hooks, options) {
        super(attacker, defender, hooks, options);

        this.data.attack = {
            base: this.actorSystem.mystic.magicProjection.imbalance.offensive.base.value,
            final: this.actorSystem.mystic.magicProjection.imbalance.offensive.final.value
        }
        this.data.spells = this.actorSystem.mystic.spells.filter(w => w.system.combatType.value === 'attack')

        const lastOffensiveSpellUsed = this.data.actor.getFlag(
            'animabf',
            'lastOffensiveSpellUsed'
        )
        if (this.data.spells.find(w => w.id === lastOffensiveSpellUsed)) {
            this.data.spellUsed = lastOffensiveSpellUsed
        } else {
            this.data.spellUsed = this.data.spells[0]?._id
        }

        const spellCastingOverride = this.data.actor.getFlag(
            'animabf',
            'spellCastingOverride'
        );

        this.castMethod = spellCastingOverride ? "override" : "accumulated"

        this.data.spellGrade = 'base'

        this.data.projectile.value = true

        this.onSpellChange()
    }

    applyModifiers(modifiers) {
        let totalModifier = super.applyModifiers(modifiers);

        return totalModifier + this.data.attack.final
    }

    calculateDamage(damageModifiers) {
        let totalModifier = super.calculateDamage(damageModifiers);

        if (this.data.spellUsed) {
            let spellUsedEffect =
                this.spell?.system.grades[this.data.spellGrade].description.value ?? '';
            return totalModifier + damageCheck(spellUsedEffect)
        }
        return totalModifier

    }

    getAttainableSpellGrades(spellUsed, castMethod) {
        if (castMethod === "override") {
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

    getSpell(spellUsed) {
        if (spellUsed) {
            return this.data.spells.find(w => w.id === spellUsed)
        }
        return undefined
    }

    onSpellChange() {
        this.data.critics = {
            selected: this.spell?.system.critic.value === "-" ? 'none' : this.spell?.system.critic.value ?? 'energy',
            primary: this.spell?.system.critic.value === "-" ? 'none' : this.spell?.system.critic.value ?? 'energy',
            secondary: 'none'
        }
        this.data.spellGrade = 'base'
        this.data.visible = this.spell?.system.visible
        this.getAttainableSpellGrades()
    }

    onAttack() {
        this.data.actor.setFlag('animabf', 'spellCastingOverride', this.castMethod === "override");
        this.data.actor.setFlag('animabf', 'lastOffensiveSpellUsed', this.data.spellUsed)

        const spellUsedEffect = this.spell?.system.grades[this.data.spellGrade].description.value ?? '';

        if (this.data.actor.evaluateCast(this.spellCasting)) {
            this.castMethod = "override";
            return;
        }
        this.data.resistanceEffect = resistanceEffectCheck(spellUsedEffect);

        let formula = `1d100xa + ${this.attack}`;
        if (!this.data.withRoll) {
            // Remove the dice from the formula
            formula = formula.replace('1d100xa', '0');
        }
        if (this.data.attack.base >= 200) {
            // Mastery reduces the fumble range
            formula = formula.replace('xa', 'xamastery');
        }

        const roll = new ABFFoundryRoll(formula, this.actorSystem);

        roll.roll();

        if (this.data.showRoll) {
            const { i18n } = game;

            const flavor = i18n.format('macros.combat.dialog.magicAttack.title', {
                spell: rollToMessageFlavor(this.spell?.name, roll),
                target: this.data.defenderToken.name
            })

            roll.toMessage({
                speaker: ChatMessage.getSpeaker({ token: this.data.token }),
                flavor
            });
        }

        const rolled = roll.total - this.attack;

        this.hooks.onAttack({
            type: 'mystic',
            values: {
                spellUsed: this.data.spellUsed,
                spellGrade: this.data.spellGrade,
                spellName: this.spell?.name,
                magicProjection: this.attack,
                spellCasting: this.spellCasting,
                damage: this.damage,
                critic: this.data.critics.selected,
                roll: rolled,
                total: roll.total,
                fumble: roll.fumbled,
                resistanceEffect: this.data.resistanceEffect,
                visible: this.data.visible,
                projectile: this.data.projectile,
                distance: this.data.distance,
                attackerCombatMod: this.modifiers //rev hace falta agregar damageModifiers? prob si
            }
        });
    }
}