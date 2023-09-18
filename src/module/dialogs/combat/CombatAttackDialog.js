import { Templates } from '../../utils/constants';
import { NoneWeaponCritic, WeaponCritic } from '../../types/combat/WeaponItemConfig';
import ABFFoundryRoll from '../../rolls/ABFFoundryRoll';
import { ABFSettingsKeys } from '../../../utils/registerSettings';
import { ABFConfig } from '../../ABFConfig';

const getInitialData = (attacker, defender, options = {}) => {
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
      counterAttackBonus: options.counterAttackBonus,
      combat: {
        fatigueUsed: 0,
        modifier: 0,
        unarmed: false,
        weaponUsed: undefined,
        criticSelected: undefined,
        weapon: undefined,
        damage: {
          special: 0,
          final: 0
        }
      },
      mystic: {
        modifier: 0,
        magicProjectionType: 'normal',
        spellUsed: undefined,
        spellGrade: 'base',
        critic: NoneWeaponCritic.NONE,
        damage: 0
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
        damage: 0
      }
    },
    defender: {
      token: defender,
      actor: defenderActor
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

    const { weapons } = this.attackerActor.system.combat;

    if (weapons.length > 0) {
      this.modalData.attacker.combat.weaponUsed = weapons[0]._id;
    } else {
      this.modalData.attacker.combat.unarmed = true;
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
        weapon,
        criticSelected,
        modifier,
        fatigueUsed,
        damage,
        weaponUsed,
        unarmed
      } = this.modalData.attacker.combat;

      if (typeof damage !== 'undefined') {
        const attack = weapon
          ? weapon.system.attack.final.value
          : this.attackerActor.system.combat.attack.final.value;

        const counterAttackBonus = this.modalData.attacker.counterAttackBonus ?? 0;

        let formula = `1d100xa + ${counterAttackBonus} + ${attack} + ${modifier ?? 0} + ${
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

        const rolled =
          roll.total -
          counterAttackBonus -
          attack -
          (modifier ?? 0) -
          (fatigueUsed ?? 0) * 15;

        this.hooks.onAttack({
          type: 'combat',
          values: {
            unarmed,
            damage: damage.final,
            attack,
            weaponUsed,
            critic,
            modifier,
            fatigueUsed,
            roll: rolled,
            total: roll.total,
            fumble: roll.fumbled
          }
        });

        this.modalData.attackSent = true;

        this.render();
      }
    });

    html.find('.send-mystic-attack').click(() => {
      const { magicProjectionType, spellGrade, spellUsed, modifier, critic, damage } =
        this.modalData.attacker.mystic;

      if (spellUsed) {
        let baseMagicProjection;
        let magicProjection;
        if (magicProjectionType === 'normal') {
          magicProjection = this.attackerActor.system.mystic.magicProjection.final.value;
          baseMagicProjection =
            this.attackerActor.system.mystic.magicProjection.base.value;
        } else {
          magicProjection =
            this.attackerActor.system.mystic.magicProjection.imbalance.offensive.final
              .value;
          baseMagicProjection =
            this.attackerActor.system.mystic.magicProjection.imbalance.offensive.base
              .value;
        }

        let formula = `1d100xa + ${magicProjection} + ${modifier ?? 0}`;
        if (this.modalData.attacker.withoutRoll) {
          // Remove the dice from the formula
          formula = formula.replace('1d100xa', '0');
        }
        if (baseMagicProjection >= 200) {
          // Mastery reduces the fumble range
          formula = formula.replace('xa', 'xamastery');
        }

        const roll = new ABFFoundryRoll(formula, this.attackerActor.system);
        roll.roll();

        if (this.modalData.attacker.showRoll) {
          const { i18n } = game;

          const { spells } = this.attackerActor.system.mystic;

          const spell = spells.find(w => w._id === spellUsed);

          const flavor = i18n.format('macros.combat.dialog.magicAttack.title', {
            spell: spell.name,
            target: this.modalData.defender.token.name
          });

          roll.toMessage({
            speaker: ChatMessage.getSpeaker({ token: this.modalData.attacker.token }),
            flavor
          });
        }

        const rolled = roll.total - magicProjection - (modifier ?? 0);

        this.hooks.onAttack({
          type: 'mystic',
          values: {
            modifier,
            spellUsed,
            spellGrade,
            magicProjection,
            critic,
            damage,
            roll: rolled,
            total: roll.total,
            fumble: roll.fumbled
          }
        });

        this.modalData.attackSent = true;

        this.render();
      }
    });

    html.find('.send-psychic-attack').click(() => {
      const { powerUsed, modifier, psychicPotential, psychicProjection, critic, damage } =
        this.modalData.attacker.psychic;

      if (powerUsed) {
        let formula = `1d100xa + ${psychicProjection} + ${modifier ?? 0}`;
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
          `1d100xa + ${psychicPotential.final}`,
          this.modalData.attacker.actor.system
        );
        psychicPotentialRoll.roll();

        if (this.modalData.attacker.showRoll) {
          const { i18n } = game;

          const powers = this.attackerActor.system.psychic.psychicPowers;

          const power = powers.find(w => w._id === powerUsed);

          psychicPotentialRoll.toMessage({
            speaker: ChatMessage.getSpeaker({ token: this.modalData.attacker.token }),
            flavor: i18n.format('macros.combat.dialog.psychicPotential.title')
          });

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

        const rolled = psychicProjectionRoll.total - psychicProjection - (modifier ?? 0);

        this.hooks.onAttack({
          type: 'psychic',
          values: {
            modifier,
            powerUsed,
            psychicPotential: psychicPotentialRoll.total,
            psychicProjection,
            critic,
            damage,
            roll: rolled,
            total: psychicProjectionRoll.total,
            fumble: psychicProjectionRoll.fumbled
          }
        });

        this.modalData.attackSent = true;

        this.render();
      }
    });
  }

  getData() {
    const {
      attacker: { combat, psychic },
      ui
    } = this.modalData;

    ui.hasFatiguePoints =
      this.attackerActor.system.characteristics.secondaries.fatigue.value > 0;

    psychic.psychicPotential.final =
      psychic.psychicPotential.special +
      this.attackerActor.system.psychic.psychicPotential.final.value;

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
