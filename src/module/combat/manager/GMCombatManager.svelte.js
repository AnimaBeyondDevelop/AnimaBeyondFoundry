import { ABFSettingsKeys } from '../../../utils/registerSettings';
import { calculateCombatResult } from '@module/combat/utils/calculateCombatResult';
import { calculateATReductionByQuality } from '@module/combat/utils/calculateATReductionByQuality';
import { executeMacro } from '@module/utils/functions/executeMacro';

export class GMCombatManager {
    data = $state({
        attacker: {
            actor: {},
            token: {},
            isReady: false
        },
        defender: {
            actor: {},
            token: {},
            supernaturalShield: {
                dobleDamage: false,
                immuneToDamage: false
            },
            isReady: false
        }
    })
    attack = $derived(this.applyModifiers(this.attackModifiers, this.data.attacker.result?.values.attack ?? 0))
    defense = $derived(this.applyModifiers(this.defenseModifiers, this.data.defender.result?.values.defense ?? 0))
    damage = $derived(this.applyModifiers(this.damageModifiers, this.data.attacker.result?.values.damage ?? 0))
    armor = $derived(this.applyModifiers(this.armorModifiers, this.data.defender.result?.values.armor ?? 0))

    attackModifiers = $state({ custom: { modifier: 0, active: true } })
    defenseModifiers = $state({ custom: { modifier: 0, active: true } })
    damageModifiers = $state({ custom: { modifier: 0, active: true } })
    armorModifiers = $state({ custom: { modifier: 0, active: true } })

    calculations = $derived(this.calculateCombat(attackModifiers, defenseModifiers, damageModifiers, armorModifiers))

    constructor(attacker, defender, hooks, bonus, options) {
        this.data.attacker.actor = attacker.actor
        this.data.attacker.token = attacker
        this.data.defender.actor = defender.actor
        this.data.defender.token = defender

        this.hooks = hooks
        this.options = options
    }

    async close(options = { executeHook: true }) {
        if (options?.executeHook) {
            await this.hooks.onClose();
        }

        return this.options.onClose();
    }

    async makeCounter() {
        await this.applyValuesIfBeAble();
        if (this.modalData.calculations?.canCounter) {
            this.hooks.onCounterAttack(this.calculations.counterAttackBonus);
        }
    }

    async applyValues() {
        await this.applyValuesIfBeAble();
        this.close
    }

    updateAttackerData(result) {
        const { attacker } = this.data;
        attacker.result = result;

        for (let key in result.values.attackerCombatMod) {
            this.attackModifiers[key] = result.values.attackerCombatMod[key]
        }
        attacker.isReady = true
    }

    updateDefenderData(result) {
        const { defender } = this.data;
        defender.result = result;

        for (let key in result.values.defenderCombatMod) {
            this.defenseModifiers[key] = result.values.defenderCombatMod[key]
        }
        defender.isReady = true
    }

    applyModifiers(modifiers, baseValue) {
        let totalModifier = 0;
        for (let key in modifiers) {
            totalModifier += modifiers[key].active ? modifiers[key].modifier : 0;
        }
        return Math.max(totalModifier + baseValue, 0)
    }

    calculateCombat() {
        const { attacker, defender } = this.data
        const calculations = {
            difference: this.attack - this.defense,
            winner: this.attack > this.defense ? attacker.token : defender.token,
            canCounter: false
        }

        if (this.damage !== 0) {
            const combatResult = calculateCombatResult(
                this.attack,
                this.defense,
                Math.max(
                    defender.result.values.at - calculateATReductionByQuality(attacker.result),
                    0
                ),
                attacker.result.values.damage,
                defender.result.type === 'resistance' ? defender.result.values.surprised : false
            );
            if (combatResult.canCounterAttack) {
                calculations.canCounter = true;
                calculations.counterAttackBonus = combatResult.counterAttackBonus
            } else {
                calculations.damage = combatResult.damage
            };
        }

        return calculations
    }

    async applyValuesIfBeAble() {
        const { attacker, defender } = this.data

        for (let combatant of [attacker, defender]) {
            if (combatant.result?.type === 'combat') {
                combatant.actor.applyFatigue(combatant.result.values.fatigueUsed);
            }

            if (combatant.result?.type === 'mystic') {
                const { spellCasting, spellName, spellGrade } =
                    combatant.result.values;
                combatant.actor.mysticCast(spellCasting, spellName, spellGrade);
            }
        }

        this.accumulateDefensesIfAble();
        const supShieldId = await this.newSupernaturalShieldIfBeAble();

        if (this.calculations?.damage > 0) {
            this.defenderActor.applyDamage(this.calculations.damage);
        } else {
            this.applyDamageSupernaturalShieldIfBeAble(supShieldId);
        }

        this.executeCombatMacro();
    }

    accumulateDefensesIfAble() {
        if (this.data.defender.result?.type === 'combat') {
            this.data.defender.actor.accumulateDefenses(
                this.data.defender.result.values?.accumulateDefenses
            );
        }
    }

    async newSupernaturalShieldIfBeAble() {
        if (
            (this.data.defender.result?.type === 'mystic' ||
                this.data.defender.result?.type === 'psychic') &&
            this.data.defender.result?.values.supShield.create
        ) {
            const supShieldId = await this.data.defender.actor.newSupernaturalShield(
                this.data.defender.result.type,
                this.data.defender.result?.power ?? {},
                this.data.defender.result.values?.psychicPotential ?? 0,
                this.data.defender.result.spell ?? {},
                this.data.defender.result.values?.spellGrade
            );
            return supShieldId;
        }
    }

    applyDamageSupernaturalShieldIfBeAble(supShieldId) {
        const { attacker, defender } = this.data;
        const { dobleDamage, immuneToDamage } = defender.supernaturalShield;
        if (immuneToDamage) { return };
        if (this.calculations.winner == attacker.token) { return };
        if (defender.result?.type !== 'mystic' &&
            defender.result?.type !== 'psychic') { return };

        const { supShield } = defender.result?.values;
        const newCombatResult = {
            attack: this.damage > 0 ? this.attack : 0,
            at: Math.max(
                defender.result.values.at - calculateATReductionByQuality(attacker.result),
                0
            ),
            halvedAbsorption: defender.result.type === 'resistance'
                ? defender.result.values.surprised
                : false
        };

        if (supShieldId) {
            supShield.id = supShieldId;
        }

        defender.actor.applyDamageSupernaturalShield(
            supShield.id,
            this.damage,
            dobleDamage,
            newCombatResult
        );
    }

    executeCombatMacro() {
        const missedAttackValue = game.settings.get(
            'animabf',
            ABFSettingsKeys.MACRO_MISS_ATTACK_VALUE
        );
        const macroPrefixAttack = game.settings.get(
            'animabf',
            ABFSettingsKeys.MACRO_PREFIX_ATTACK
        );
        const { attacker, defender, calculations } = this.modalData
        const winner =
            calculations.winner === defender.token
                ? 'defender'
                : 'attacker';
        let macroName;
        let args = {
            attacker: attacker.token,
            spellGrade: attacker.result.values.spellGrade,
            psychicPotential: attacker.result.values?.psychicPotential,
            projectile: attacker.result.values?.projectile,
            defenders: [{
                defender: defender.token,
                winner,
                defenseType: defender.result.type === 'combat' ? defender.result.values.type : defender.result.type,
                totalAttack: attacker.result.values.total,
                appliedDamage: calculations.damage,
                damageType: attacker.result.values?.critic,
                bloodColor: 'red', // add bloodColor to actor template
                missedAttack: false,
                defenderPsychicFatigue: defender.result.values?.psychicFatigue,
                criticImpact: 0
            }]
        };
        if (args.defenders[0].totalAttack < missedAttackValue && winner === 'defener') {
            args.defenders[0].missedAttack = true;
        }

        if (attacker.result?.type === 'combat') {
            if (!attacker.result.weapon) {
                attacker.result.weapon = { name: 'Unarmed' }
            }
            macroName = macroPrefixAttack + attacker.result.weapon.name;
        } else if (attacker.result?.type === 'mystic') {
            macroName = attacker.result.values.spell.name;
        } else if (attacker.result?.type === 'psychic') {
            macroName = attacker.result.values.power.name;
        }

        if (attacker.result?.values.macro) {
            macroName = attacker.result?.values.macro;
        }

        executeMacro(macroName, args)
    }
}