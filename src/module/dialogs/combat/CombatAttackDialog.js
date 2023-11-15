import { Templates } from '../../utils/constants';
import { NoneWeaponCritic, WeaponCritic } from '../../types/combat/WeaponItemConfig';
import { resistanceEffectCheck } from '../../combat/utils/resistanceEffectCheck.js';
import { damageCheck } from '../../combat/utils/damageCheck.js';
import { mysticCanCastEvaluate } from '../../combat/utils/mysticCanCastEvaluate.js';
import { evaluateCast } from '../../combat/utils/evaluateCast.js';
import ABFFoundryRoll from '../../rolls/ABFFoundryRoll';
import { ABFSettingsKeys } from '../../../utils/registerSettings';
import { ABFConfig } from '../../ABFConfig';

const getInitialData = (attacker, defender, options = {}) => {
  const combatDistance = !!game.settings.get(
    'animabf',
    ABFSettingsKeys.AUTOMATE_COMBAT_DISTANCE
  );
  const showRollByDefault = !!game.settings.get(
    'animabf',
    ABFSettingsKeys.SEND_ROLL_MESSAGES_ON_COMBAT_BY_DEFAULT
  );
  const isGM = !!game.user?.isGM;

  const attackerActor = attacker.actor;
  const defenderActor = defender.actor;

  return {
    ui: {
      isGM,
      hasFatiguePoints:
        attackerActor.system.characteristics.secondaries.fatigue.value > 0,
      weaponHasSecondaryCritic: undefined
    },
    attacker: {
      token: attacker,
      actor: attackerActor,
      showRoll: !isGM || showRollByDefault,
      withoutRoll: false,
      poorVisibility: false,
      targetInCover: false,
      counterAttackBonus: options.counterAttackBonus,
      zen: attackerActor.system.general.settings.zen.value,
      inhuman: attackerActor.system.general.settings.inhuman.value,
      inmaterial: attackerActor.system.general.settings.inmaterial.value,
      combat: {
        fatigueUsed: 0,
        modifier: 0,
        unarmed: false,
        weaponUsed: undefined,
        criticSelected: undefined,
        weapon: undefined,
        resistanceEffect: { value: 0, type: undefined, check: false },
        visible: true,
        highGround: false,
        distance: {
          value: 0,
          enable: combatDistance,
          check: false
        },
        projectile: {
          value: false,
          type: ''
        },
        damage: {
          special: 0,
          final: 0
        }
      },
      mystic: {
        modifier: 0,
        magicProjection: {
          base: attackerActor.system.mystic.magicProjection.imbalance.offensive.base
            .value,
          final:
            attackerActor.system.mystic.magicProjection.imbalance.offensive.final.value
        },
        spellUsed: undefined,
        spellGrade: 'base',
        spellCasting: {
          zeon: { accumulated: 0, cost: 0 },
          canCast: { prepared: false, innate: false },
          casted: { prepared: false, innate: false },
          override: { value: false, ui: false }
        },
        critic: NoneWeaponCritic.NONE,
        resistanceEffect: { value: 0, type: undefined, check: false },
        visible: false,
        distance: {
          value: 0,
          enable: combatDistance,
          check: false
        },
        projectile: {
          value: true,
          type: 'shot'
        },
        damage: {
          special: 0,
          final: 0
        }
      },
      psychic: {
        modifier: 0,
        psychicProjection:
          attackerActor.system.psychic.psychicProjection.imbalance.offensive.final.value,
        psychicPotential: {
          special: 0,
          final: attackerActor.system.psychic.psychicPotential.final.value
        },
        powerUsed: undefined,
        critic: NoneWeaponCritic.NONE,
        fatigueCheck: false,
        resistanceEffect: { value: 0, type: undefined, check: false },
        visible: false,
        distance: {
          value: 0,
          enable: combatDistance,
          check: false
        },
        projectile: {
          value: true,
          type: 'shot'
        },
        damageModifier: 0
      }
    },
    defender: {
      token: defender,
      actor: defenderActor,
      inmaterial: defenderActor.system.general.settings.inmaterial.value
    },
    attackSent: false,
    allowed: false,
    config: ABFConfig
  };
};

export class CombatAttackDialog extends FormApplication {
  constructor(attacker, defender, hooks, options = {}) {
    super(getInitialData(attacker, defender, options));

    this.modalData = getInitialData(attacker, defender, options);

    const { combat, psychic, mystic } = this.modalData.attacker;

    if (this.modalData.attacker.combat.distance.enable) {
      const calculateDistance = Math.floor(
        canvas.grid.measureDistance(
          this.modalData.attacker.token,
          this.modalData.defender.token
        )
      );
      combat.distance.value = calculateDistance;
      psychic.distance.value = calculateDistance;
      mystic.distance.value = calculateDistance;
    }

    const { weapons } = this.attackerActor.system.combat;
    const { spells } = this.attackerActor.system.mystic;
    const { psychicPowers } = this.attackerActor.system.psychic;

    if (psychicPowers.length > 0) {
      const lastOffensivePowerUsed = this.attackerActor.getFlag(
        'animabf',
        'lastOffensivePowerUsed'
      );
      if (psychicPowers.find(w => w._id === lastOffensivePowerUsed)) {
        psychic.powerUsed = lastOffensivePowerUsed;
      } else {
        psychic.powerUsed = psychicPowers.find(
          w => w.system.combatType.value === 'attack'
        )?._id;
      }
      const power = psychicPowers.find(w => w._id === psychic.powerUsed);
      this.attackerActor.system.psychic.psychicPotential.special =
        power?.system.bonus.value;
      this.modalData.attacker.psychic.critic = power?.system.critic.value;
    }

    if (spells.length > 0) {
      const lastOffensiveSpellUsed = this.attackerActor.getFlag(
        'animabf',
        'lastOffensiveSpellUsed'
      );
      if (spells.find(w => w._id === lastOffensiveSpellUsed)) {
        mystic.spellUsed = lastOffensiveSpellUsed;
      } else {
        mystic.spellUsed = spells.find(w => w.system.combatType.value === 'attack')?._id;
      }
      const spell = spells.find(w => w._id === mystic.spellUsed);
      const spellUsedEffect = spell?.system.grades.base.description.value;
      mystic.damage.final = mystic.damage.special + damageCheck(spellUsedEffect);
      mystic.spellCasting.zeon.accumulated =
        this.attackerActor.system.mystic.zeon.accumulated.value ?? 0;
      const canCast = mysticCanCastEvaluate(this.attackerActor, spell, mystic.spellGrade);
      mystic.spellCasting.canCast = canCast;
      const spellCastingOverride = this.attackerActor.getFlag(
        'animabf',
        'spellCastingOverride'
      );
      mystic.spellCasting.override.value = spellCastingOverride || false;
      mystic.spellCasting.override.ui = spellCastingOverride || false;
    }

    if (weapons.length > 0) {
      const lastOffensiveWeaponUsed = this.attackerActor.getFlag(
        'animabf',
        'lastOffensiveWeaponUsed'
      );
      if (weapons.find(weapon => weapon._id == lastOffensiveWeaponUsed)) {
        combat.weaponUsed = lastOffensiveWeaponUsed;
      } else {
        combat.weaponUsed = weapons[0]._id;
      }
    } else {
      combat.unarmed = true;
    }

    this.modalData.allowed = game.user?.isGM || (options.allowed ?? false);

    this.hooks = hooks;

    this.render(true);
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['abf-dialog combat-attack-dialog no-close'],
      submitOnChange: true,
      closeOnSubmit: false,
      width: null,
      height: null,
      resizable: true,
      template: Templates.Dialog.Combat.CombatAttackDialog.main,
      title: game.i18n.localize('macros.combat.dialog.modal.attack.title'),
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-body',
          initial: 'combat'
        }
      ]
    });
  }

  get attackerActor() {
    return this.modalData.attacker.token.actor;
  }

  updatePermissions(allowed) {
    this.modalData.allowed = allowed;

    this.render();
  }

  async close(options) {
    if (options?.force) {
      return super.close(options);
    }

    // eslint-disable-next-line no-useless-return,consistent-return
    return;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find('.send-attack').click(() => {
      const {
        combat: {
          weapon,
          criticSelected,
          modifier,
          fatigueUsed,
          damage,
          weaponUsed,
          unarmed,
          visible,
          distance
        },
        highGround,
        poorVisibility,
        targetInCover
      } = this.modalData.attacker;
      this.attackerActor.setFlag('animabf', 'lastOffensiveWeaponUsed', weaponUsed);
      if (typeof damage !== 'undefined') {
        const attackerCombatMod = [{ modifier }];
        let projectile = { value: false, type: '' };
        if (weapon?.system.isRanged.value) {
          projectile = {
            value: true,
            type: weapon.system.shotType.value
          };
          if (
            (!distance.enable && distance.check) ||
            (distance.enable && distance.value <= 1)
          ) {
            attackerCombatMod.push({ projectileDistance: 30 });
          }
          if (highGround) {
            attackerCombatMod.push({ highGround: 20 });
          }
          if (poorVisibility) {
            attackerCombatMod.push({ poorVisibility: -20 });
          }
          if (targetInCover) {
            attackerCombatMod.push({ targetInCover: -40 });
          }
        }
        if (
          weapon !== undefined &&
          criticSelected !== NoneWeaponCritic.NONE &&
          criticSelected == weapon?.system.critic.secondary.value
        ) {
          attackerCombatMod.push({ secondaryCritic: -10 });
        }
        const attack = weapon
          ? weapon.system.attack.final.value
          : this.attackerActor.system.combat.attack.final.value;

        const counterAttackBonus = this.modalData.attacker.counterAttackBonus ?? 0;
        const combatModifier = attackerCombatMod.reduce(
          (prev, curr) => prev + Object.values(curr)[0],
          0
        );
        let formula = `1d100xa + ${counterAttackBonus} + ${attack} + ${combatModifier} + ${
          fatigueUsed ?? 0
        }* 15`;
        if (this.modalData.attacker.withoutRoll) {
          // Remove the dice from the formula
          formula = formula.replace('1d100xa', '0');
        }
        if (this.attackerActor.system.combat.attack.base.value >= 200) {
          // Mastery reduces the fumble range
          formula = formula.replace('xa', 'xamastery');
        }

        const roll = new ABFFoundryRoll(formula, this.attackerActor.system);

        roll.roll();

        if (this.modalData.attacker.showRoll) {
          const { i18n } = game;

          const flavor = weapon
            ? i18n.format('macros.combat.dialog.physicalAttack.title', {
                weapon: weapon?.name,
                target: this.modalData.defender.token.name
              })
            : i18n.format('macros.combat.dialog.physicalAttack.unarmed.title', {
                target: this.modalData.defender.token.name
              });

          roll.toMessage({
            speaker: ChatMessage.getSpeaker({ token: this.modalData.attacker.token }),
            flavor
          });
        }

        const critic = criticSelected ?? WeaponCritic.IMPACT;
        let resistanceEffect = { value: 0, type: undefined, check: false };
        if (weapon !== undefined) {
          resistanceEffect = resistanceEffectCheck(weapon.system.special.value);
        }

        const rolled =
          roll.total -
          counterAttackBonus -
          attack -
          (combatModifier ?? 0) -
          (fatigueUsed ?? 0) * 15;

        this.hooks.onAttack({
          type: 'combat',
          values: {
            unarmed,
            damage: damage.final,
            attack,
            weaponUsed,
            critic,
            modifier: combatModifier,
            fatigueUsed,
            roll: rolled,
            total: roll.total,
            fumble: roll.fumbled,
            resistanceEffect,
            visible,
            distance,
            projectile,
            attackerCombatMod
          }
        });

        this.modalData.attackSent = true;

        this.render();
      }
    });

    html.find('.send-mystic-attack').click(() => {
      const {
        magicProjection,
        spellUsed,
        spellGrade,
        spellCasting,
        modifier,
        critic,
        damage,
        projectile,
        distance
      } = this.modalData.attacker.mystic;
      if (spellUsed) {
        const attackerCombatMod = [{ modifier }];
        this.attackerActor.setFlag(
          'animabf',
          'spellCastingOverride',
          spellCasting.override.value
        );
        this.attackerActor.setFlag('animabf', 'lastOffensiveSpellUsed', spellUsed);
        const { spells } = this.attackerActor.system.mystic;
        const spell = spells.find(w => w._id === spellUsed);
        const spellUsedEffect = spell?.system.grades[spellGrade].description.value ?? '';
        spellCasting.zeon.cost = spell?.system.grades[spellGrade].zeon.value;
        let evaluateCastMsj = evaluateCast(spellCasting);
        if (evaluateCastMsj !== undefined) {
          spellCasting.override.ui = true;
          return evaluateCastMsj;
        }
        let visibleCheck = spell?.system.visible;

        let resistanceEffect = resistanceEffectCheck(spellUsedEffect);

        const combatModifier = attackerCombatMod.reduce(
          (prev, curr) => prev + Object.values(curr)[0],
          0
        );
        let formula = `1d100xa + ${magicProjection.final} + ${combatModifier ?? 0}`;
        if (this.modalData.attacker.withoutRoll) {
          // Remove the dice from the formula
          formula = formula.replace('1d100xa', '0');
        }
        if (magicProjection.base >= 200) {
          // Mastery reduces the fumble range
          formula = formula.replace('xa', 'xamastery');
        }

        const roll = new ABFFoundryRoll(formula, this.attackerActor.system);
        roll.roll();

        if (this.modalData.attacker.showRoll) {
          const { i18n } = game;

          const flavor = i18n.format('macros.combat.dialog.magicAttack.title', {
            spell: spell.name,
            target: this.modalData.defender.token.name
          });

          roll.toMessage({
            speaker: ChatMessage.getSpeaker({ token: this.modalData.attacker.token }),
            flavor
          });
        }

        const rolled = roll.total - magicProjection.final - (combatModifier ?? 0);

        this.hooks.onAttack({
          type: 'mystic',
          values: {
            modifier: combatModifier,
            spellUsed,
            spellGrade,
            spellName: spell.name,
            magicProjection: magicProjection.final,
            critic,
            damage: damage.final,
            roll: rolled,
            total: roll.total,
            fumble: roll.fumbled,
            resistanceEffect,
            visible: visibleCheck,
            distance,
            projectile,
            spellCasting,
            macro: spell.macro,
            attackerCombatMod
          }
        });

        this.modalData.attackSent = true;

        this.render();
      }
    });

    html.find('.send-psychic-attack').click(async () => {
      const {
        powerUsed,
        modifier,
        psychicPotential,
        psychicProjection,
        critic,
        damageModifier,
        projectile,
        distance
      } = this.modalData.attacker.psychic;
      const { i18n } = game;
      if (powerUsed) {
        const attackerCombatMod = [{ modifier }];
        const { psychicPowers } = this.attackerActor.system.psychic;
        const power = psychicPowers.find(w => w._id === powerUsed);
        this.attackerActor.setFlag('animabf', 'lastOffensivePowerUsed', powerUsed);
        const combatModifier = attackerCombatMod.reduce(
          (prev, curr) => prev + Object.values(curr)[0],
          0
        );
        let formula = `1d100xa + ${psychicProjection} + ${combatModifier ?? 0}`;
        if (this.modalData.attacker.withoutRoll) {
          // Remove the dice from the formula
          formula = formula.replace('1d100xa', '0');
        }
        if (this.attackerActor.system.psychic.psychicProjection.base.value >= 200) {
          // Mastery reduces the fumble range
          formula = formula.replace('xa', 'xamastery');
        }

        const psychicProjectionRoll = new ABFFoundryRoll(
          formula,
          this.attackerActor.system
        );
        psychicProjectionRoll.roll();

        const psychicPotentialRoll = new ABFFoundryRoll(
          `1d100PsychicRoll + ${psychicPotential.final}`,
          { ...this.attackerActor.system, power }
        );
        psychicPotentialRoll.roll();
        if (this.modalData.attacker.showRoll) {
          psychicPotentialRoll.toMessage({
            speaker: ChatMessage.getSpeaker({ token: this.modalData.attacker.token }),
            flavor: i18n.format('macros.combat.dialog.psychicPotential.title')
          });
        }

        const fatigue = await this.attackerActor.evaluatePsychicFatigue(
          power,
          psychicPotentialRoll.total,
          this.modalData.attacker.showRoll
        );

        if (this.modalData.attacker.showRoll) {
          if (!fatigue) {
            const projectionFlavor = i18n.format(
              'macros.combat.dialog.psychicAttack.title',
              {
                power: power.name,
                target: this.modalData.defender.token.name,
                potential: psychicPotentialRoll.total
              }
            );
            psychicProjectionRoll.toMessage({
              speaker: ChatMessage.getSpeaker({ token: this.modalData.attacker.token }),
              flavor: projectionFlavor
            });
          }
        }

        const powerUsedEffect = power?.system.effects[psychicPotentialRoll.total].value;
        let damage = damageCheck(powerUsedEffect) + damageModifier;
        let resistanceEffect = resistanceEffectCheck(powerUsedEffect);
        let visibleCheck = power?.system.visible;

        const rolled =
          psychicProjectionRoll.total - psychicProjection - (combatModifier ?? 0);
        this.hooks.onAttack({
          type: 'psychic',
          values: {
            modifier: combatModifier,
            powerUsed,
            powerName: power.name,
            psychicPotential: psychicPotentialRoll.total,
            psychicProjection,
            critic,
            damage,
            fatigueCheck: fatigue.value,
            roll: rolled,
            total: psychicProjectionRoll.total,
            fumble: psychicProjectionRoll.fumbled,
            resistanceEffect,
            visible: visibleCheck,
            distance,
            projectile,
            macro: power.macro,
            attackerCombatMod
          }
        });

        this.modalData.attackSent = true;

        this.render();
      }
    });
  }

  getData() {
    const {
      attacker: { combat, psychic, mystic },
      ui
    } = this.modalData;

    ui.hasFatiguePoints =
      this.attackerActor.system.characteristics.secondaries.fatigue.value > 0;

    const { psychicPowers } = this.attackerActor.system.psychic;
    if (!psychic.powerUsed) {
      psychic.powerUsed = psychicPowers.find(
        w => w.system.combatType.value === 'attack'
      )?._id;
    }
    const power = psychicPowers.find(w => w._id === psychic.powerUsed);
    psychic.critic = power?.system.critic.value ?? NoneWeaponCritic.NONE;
    let psychicBonus = power?.system.bonus.value ?? 0;
    psychic.psychicPotential.final =
      psychic.psychicPotential.special +
      this.attackerActor.system.psychic.psychicPotential.final.value +
      psychicBonus;

    const { spells } = this.attackerActor.system.mystic;
    if (!mystic.spellUsed) {
      mystic.spellUsed = spells.find(w => w.system.combatType.value === 'attack')?._id;
    }
    const spell = spells.find(w => w._id === mystic.spellUsed);
    mystic.critic = spell?.system.critic.value ?? NoneWeaponCritic.NONE;
    const spellUsedEffect =
      spell?.system.grades[mystic.spellGrade].description.value ?? '';
    mystic.damage.final = mystic.damage.special + damageCheck(spellUsedEffect);
    const canCast = mysticCanCastEvaluate(this.attackerActor, spell, mystic.spellGrade);
    mystic.spellCasting.canCast = canCast;
    if (!mystic.spellCasting.canCast.innate) {
      mystic.spellCasting.casted.innate = false;
    }
    if (!mystic.spellCasting.canCast.prepared) {
      mystic.spellCasting.casted.prepared = false;
    }

    const { weapons } = this.attackerActor.system.combat;

    const weapon = weapons.find(w => w._id === combat.weaponUsed);

    combat.unarmed = weapons.length === 0;

    if (combat.unarmed) {
      combat.damage.final =
        combat.damage.special +
        10 +
        this.attackerActor.system.characteristics.primaries.strength.mod;
    } else {
      combat.weapon = weapon;
      if (weapon?.system.isRanged.value) {
        combat.projectile = {
          value: true,
          type: weapon.system.shotType.value
        };
      } else {
        combat.projectile = {
          value: false,
          type: ''
        };
      }

      if (!combat.criticSelected) {
        combat.criticSelected = weapon.system.critic.primary.value;
      }

      ui.weaponHasSecondaryCritic =
        weapon.system.critic.secondary.value !== NoneWeaponCritic.NONE;

      combat.damage.final = combat.damage.special + weapon.system.damage.final.value;
    }

    this.modalData.config = ABFConfig;

    return this.modalData;
  }

  async _updateObject(event, formData) {
    const prevWeapon = this.modalData.attacker.combat.weaponUsed;

    this.modalData = mergeObject(this.modalData, formData);

    if (prevWeapon !== this.modalData.attacker.combat.weaponUsed) {
      this.modalData.attacker.combat.criticSelected = undefined;
    }

    this.render();
  }
}
