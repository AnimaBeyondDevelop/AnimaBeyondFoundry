import { DefenseManager } from '@module/combat/manager/DefenseManager.svelte.js'
import { rollToMessageFlavor } from '@module/combat/utils/rollToMessageFlavor.js'
import ABFFoundryRoll from '@module/rolls/ABFFoundryRoll';

export class CombatDefenseManager extends DefenseManager {
    weapon = $derived(this.getWeapon(this.data.weaponUsed));

    constructor(attacker, defender, hooks, options) {
        super(attacker, defender, hooks, options);

        this.data.block = {
            base: this.actorSystem.combat.block.base.value,
            final: this.actorSystem.combat.block.final.value
        }
        this.data.dodge = {
            base: this.actorSystem.combat.dodge.base.value,
            final: this.actorSystem.combat.dodge.final.value
        }
        this.data.defenseType = this.data.block.final > this.data.dodge.final ? "block" : "dodge"

        this.data.fatigue = { used: 0, available: this.actorSystem.characteristics.secondaries.fatigue.value };
        this.data.weapons = this.actorSystem.combat.weapons

        const lastDefensiveWeaponUsed = this.data.actor.getFlag(
            'animabf',
            'lastDefensiveWeaponUsed'
        )
        if (this.data.weapons.find(w => w.id === lastDefensiveWeaponUsed)) {
            this.data.weaponUsed = lastDefensiveWeaponUsed
        } else {
            this.data.weaponUsed = this.data.weapons[0]?._id ?? "unarmed"
        }

        const defensesCounter = this.data.actor.getFlag('animabf', 'defensesCounter') || {
            accumulated: 0,
            keepAccumulating: true
        };

        this.data.defenseCounter = defensesCounter

        this.addMultipleDefensesPenalty(this.data.defenseCounter.accumulated)
        this.onWeaponChange()
    }

    addMultipleDefensesPenalty(value) {
        this.addModifier("multipleDefensesPenalty", value)
    }

    applyModifiers(modifiers) {
        let totalModifier = super.applyModifiers(modifiers);

        const { defenseType, weaponUsed } = this.data;

        if (defenseType === "dodge" || weaponUsed === "unarmed") {
            return this.data[defenseType].final + totalModifier;
        }
        return this.weapon.system.block.final.value + totalModifier;
    }

    getWeapon(weaponUsed) {
        if (weaponUsed === "unarmed") {
            return undefined
        }
        return this.data.weapons.find(w => w.id === weaponUsed)
    }

    onWeaponChange() {
        this.removeModifiers([
            "dodgeProjectile",
            "parryProjectile",
            "shieldParryProjectile",
            "maestryParryProjectile",
            "parryThrow",
        ])
        const { attacker: { distance, projectile }, defenseType } = this.data
        let isShield = this.weapon?.system.isShield.value;
        let maestry = this.data[defenseType].base >= 200;

        if (!distance.pointBlank) {
            if (projectile.type === 'shot') {
                if (defenseType === "block") {
                    if (maestry && !isShield) {
                        this.addModifier("maestryParryProjectile", 1);
                    } else if (!maestry) {
                        this.addModifier(isShield ? "shieldParryProjectile" : "parryProjectile", 1);
                    }
                }
                if (defenseType === "dodge" && !maestry) {
                    this.addModifier("dodgeProjectile", 1)
                }
            }
            if (projectile.type === 'throw' && defenseType === "block" && !maestry && !isShield) {
                this.addModifier("parryThrow", 1);
            }
        }
    }

    onDefense() {
        this.data.actor.setFlag('animabf', 'lastDefensiveWeaponUsed', this.data.weaponUsed)

        let formula = `1d100xa + ${this.defense}`;
        if (!this.data.withRoll) {
            // Remove the dice from the formula
            formula = formula.replace('1d100xa', '0');
        }
        if (this.data[this.data.defenseType].base >= 200) {
            // Mastery reduces the fumble range
            formula = formula.replace('xa', 'xamastery');
        }

        const roll = new ABFFoundryRoll(formula, this.actorSystem);

        roll.roll();

        if (this.data.showRoll) {
            const { i18n } = game;

            const flavor = i18n.format(`macros.combat.dialog.physicalDefense.${this.data.defenseType}.title`, {
                target: this.data.attacker.token.name
            }); // Integrar rollToMessageFlavor

            roll.toMessage({
                speaker: ChatMessage.getSpeaker({ token: this.data.token }),
                flavor
            });
        }

        const rolled = roll.total - this.defense;

        this.hooks.onDefense({
            type: 'combat',
            values: {
                type: this.data.defenseType,
                unarmed: this.data.weaponUsed === 'unarmed', //rev
                defense: this.defense,
                at: this.armor,
                weaponUsed: this.data.weaponUsed,
                fatigueUsed: this.data.fatigue.used,
                roll: rolled,
                total: roll.total,
                fumble: roll.fumbled,
                accumulateDefenses: this.data.defenseCounter.keepAccumulating,
                defenderCombatMod: this.modifiers //rev hace falta agregar armorModifiers?
            }
        });
    }
}