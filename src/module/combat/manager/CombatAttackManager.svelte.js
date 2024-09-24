import { resistanceEffectCheck } from '@module/combat/utils/resistanceEffectCheck.js';
import { AttackManager } from '@module/combat/manager/AttackManager.svelte.js'
import { rollToMessageFlavor } from '@module/combat/utils/rollToMessageFlavor.js'
import ABFFoundryRoll from '@module/rolls/ABFFoundryRoll';

export class CombatAttackManager extends AttackManager {
    weapon = $derived(this.getWeapon(this.data.weaponUsed));
    constructor(attacker, defender, hooks, options) {
        super(attacker, defender, hooks, options);

        this.data.attack = {
            base: this.data.system.combat.attack.base.value,
            final: this.data.system.combat.attack.final.value
        }
        this.data.fatigue = { used: 0, available: this.data.system.characteristics.secondaries.fatigue.value };
        this.data.weapons = this.data.system.combat.weapons

        const lastOffensiveWeaponUsed = this.data.actor.getFlag(
            'animabf',
            'lastOffensiveWeaponUsed'
        )
        if (this.data.weapons.find(w => w.id === lastOffensiveWeaponUsed)) {
            this.data.weaponUsed = lastOffensiveWeaponUsed
        } else {
            this.data.weaponUsed = this.data.weapons[0]?._id ?? "unarmed"
        }

        this.data.highGround = false
        this.data.poorVisibility = false
        this.data.targetInCover = false

        this.onWeaponChange()
    }

    applyModifiers(modifiers) {
        let totalModifier = super.applyModifiers(modifiers);

        if (this.data.weaponUsed === "unarmed") {
            return this.data.attack.final + totalModifier;
        } else {
            return this.weapon.system.attack.final.value + totalModifier
        }
    }

    calculateDamage(damageModifiers) {
        let totalModifier = super.calculateDamage(damageModifiers);

        if (this.data.weaponUsed === "unarmed") {
            return 10 + this.data.system.characteristics.primaries.strength.mod + totalModifier
        } else {
            return this.weapon.system.damage.final.value + totalModifier
        }
    }

    getWeapon(weaponUsed) {
        if (weaponUsed === "unarmed") {
            return undefined
        } else {
            return this.data.weapons.find(w => w.id === weaponUsed)
        }
    }

    onWeaponChange() {
        this.data.critics = {
            selected: this.weapon?.system.critic.primary.value === '-' ? 'none' : this.weapon?.system.critic.primary.value ?? 'impact',
            primary: this.weapon?.system.critic.primary.value === '-' ? 'none' : this.weapon?.system.critic.primary.value ?? 'impact',
            secondary: this.weapon?.system.critic.secondary.value === '-' ? 'none' : this.weapon?.system.critic.secondary.value ?? 'impact',
        }
        if (this.weapon?.system.isRanged.value) {
            let shotType = this.weapon.system.shotType.value
            this.data.projectile.value = shotType === "shot" ? true : false
            this.data.projectile.type = shotType
        } else {
            this.data.projectile.value = false
            this.data.projectile.type = ""
            this.resetProjectileModifiers()
        }
        this.distanceCheck(this.data.distance.pointBlank)
    }

    onCriticChange(critic) {
        let secondaryCritic = this.data.critics.secondary === critic ? 1 : 0;
        this.addModfier("secondaryCritic", secondaryCritic)
    }

    distanceCheck(pointBlank) {
        if (pointBlank && this.data.projectile.value && this.data.projectile.type === "shot") {
            this.addModfier("pointBlank", 1)
        } else {
            this.addModfier("pointBlank", 0)
        }
    }

    resetProjectileModifiers() {
        this.addModfier("poorVisibility", 0)
        this.addModfier("targetInCover", 0)
        this.data.poorVisibility = false
        this.data.targetInCover = false
    }

    onAttack() {
        this.data.actor.setFlag('animabf', 'lastOffensiveWeaponUsed', this.data.weaponUsed)
        if (this.weapon !== undefined) {
            this.data.resistanceEffect = resistanceEffectCheck(this.weapon.system.special.value);
        }

        let formula = `1d100xa + ${this.attack}`;
        if (!this.data.withRoll) {
            // Remove the dice from the formula
            formula = formula.replace('1d100xa', '0');
        }
        if (this.data.attack.base >= 200) {
            // Mastery reduces the fumble range
            formula = formula.replace('xa', 'xamastery');
        }

        const roll = new ABFFoundryRoll(formula, this.data.system);

        roll.roll();

        if (this.data.showRoll) {
            const { i18n } = game;

            const flavor = this.weapon
                ? i18n.format('macros.combat.dialog.physicalAttack.title', {
                    weapon: rollToMessageFlavor(this.weapon?.name, roll),
                    target: this.data.defenderToken.name
                })
                : i18n.format('macros.combat.dialog.physicalAttack.unarmed.title', {
                    unarmed: rollToMessageFlavor(i18n.format('macros.combat.dialog.unarmed.title'), roll),
                    target: this.data.defenderToken.name
                });

            roll.toMessage({
                speaker: ChatMessage.getSpeaker({ token: this.data.token }),
                flavor
            });
        }

        const rolled = roll.total - this.attack;

        this.hooks.onAttack({
            type: 'combat',
            values: {
                unarmed: this.data.weaponUsed === 'unarmed', //rev
                damage: this.damage,
                attack: this.attack,
                weaponUsed: this.data.weaponUsed,
                critic: this.data.critics.selected,
                fatigueUsed: this.data.fatigue.used,
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