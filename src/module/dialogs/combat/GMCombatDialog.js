import { NoneWeaponCritic } from '../../types/combat/WeaponItemConfig';
import { Templates } from '../../utils/constants';
import { calculateCombatResult } from '../../combat/utils/calculateCombatResult';
import { calculateATReductionByQuality } from '../../combat/utils/calculateATReductionByQuality';
import { ABFSystemName } from '../../../animabf.name';

const getInitialData = (attacker, defender, options = {}) => {
  const attackerActor = attacker.actor;
  const defenderActor = defender.actor;

  return {
    ui: {
      isCounter: options.isCounter ?? false
    },
    attacker: {
      token: attacker,
      actor: attackerActor,
      customModifier: 0,
      counterAttackBonus: options.counterAttackBonus,
      isReady: false
    },
    defender: {
      token: defender,
      actor: defenderActor,
      customModifier: 0,
      isReady: false
    }
  };
};

export class GMCombatDialog extends FormApplication {
  constructor(attacker, defender, hooks, options = {}) {
    super(getInitialData(attacker, defender, options));

    this.modalData = getInitialData(attacker, defender, options);

    this.hooks = hooks;

    this.render(true);
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['abf-dialog gm-combat-dialog'],
      submitOnChange: true,
      closeOnSubmit: false,
      height: 600,
      width: 700,
      template: `systems/${ABFSystemName}/templates/dialog/combat/gm-combat-dialog.hbs`,
      title: 'GM Combat'
    });
  }

  get attackerActor() {
    return this.modalData.attacker.token.actor;
  }

  get defenderActor() {
    return this.modalData.defender.token.actor;
  }

  get attackerToken() {
    return this.modalData.attacker.token;
  }

  get defenderToken() {
    return this.modalData.defender.token;
  }

  get isDamagingCombat() {
    const { attacker } = this.modalData;

    const isPhysicalDamagingCombat = attacker.result?.type === 'combat';

    const isMysticDamagingCombat =
      attacker.result?.type === 'mystic' &&
      attacker.result.values.critic !== NoneWeaponCritic.NONE;

    const isPsychicDamagingCombat =
      attacker.result?.type === 'psychic' &&
      attacker.result.values.critic !== NoneWeaponCritic.NONE;

    return isPhysicalDamagingCombat || isMysticDamagingCombat || isPsychicDamagingCombat;
  }

  get canApplyDamage() {
    const { calculations } = this.modalData;

    if (!calculations) return false;
    if (calculations.canCounter) return false;

    const attackOverpassDefense = calculations.difference > 0;

    const hasDamage = calculations.damage !== undefined && calculations?.damage > 0;

    return this.isDamagingCombat && attackOverpassDefense && hasDamage;
  }

  async close(options = { executeHook: true }) {
    if (options?.executeHook) {
      await this.hooks.onClose();
    }

    return super.close();
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find('.cancel-button').click(() => {
      this.close();
    });

    html.find('.make-counter').click(() => {
      this.applyValuesIfBeAble();

      if (this.modalData.calculations?.canCounter) {
        this.hooks.onCounterAttack(this.modalData.calculations.counterAttackBonus);
      }
    });

    html.find('.apply-values').click(() => {
      this.applyValuesIfBeAble();

      if (!this.modalData.calculations?.canCounter && this.canApplyDamage) {
        this.defenderActor.applyDamage(this.modalData.calculations.damage);
      }

      this.close();
    });

    html.find('.show-results').click(async () => {
      const data = {
        attacker: {
          name: this.attackerToken.name,
          img: this.attackerToken.texture.src
        },
        defender: {
          name: this.defenderToken.name,
          img: this.defenderToken.texture.src
        },
        result: this.modalData.calculations?.difference,
        canCounter: this.modalData.calculations?.canCounter
      };

      if (this.modalData.calculations?.canCounter) {
        data.bonus = this.modalData.calculations.counterAttackBonus;
      } else {
        data.damage = this.modalData.calculations?.damage;
      }

      await renderTemplate(Templates.Chat.CombatResult, data).then(content => {
        ChatMessage.create({
          content
        });
      });
    });
  }

  updateAttackerData(result) {
    this.modalData.attacker.result = result;

    if (result.type === 'combat') {
      const { weapons } = this.attackerActor.system.combat;

      this.modalData.attacker.result.weapon = weapons.find(
        w => w._id === result.values.weaponUsed
      );
    }

    if (result.type === 'mystic') {
      const { spells } = this.attackerActor.system.mystic;

      this.modalData.attacker.result.spell = spells.find(
        w => w._id === result.values.spellUsed
      );
    }

    if (result.type === 'psychic') {
      const powers = this.attackerActor.system.psychic.psychicPowers;

      this.modalData.attacker.result.power = powers.find(
        w => w._id === result.values.powerUsed
      );
    }

    this.render();
  }

  updateDefenderData(result) {
    result.values.total = Math.max(0, result.values.total);
    this.modalData.defender.result = result;

    if (result.type === 'mystic') {
      const { spells } = this.defenderActor.system.mystic;

      this.modalData.defender.result.spell = spells.find(
        w => w._id === result.values.spellUsed
      );
    }

    if (result.type === 'psychic') {
      const powers = this.defenderActor.system.psychic.psychicPowers;

      this.modalData.defender.result.power = powers.find(
        w => w._id === result.values.powerUsed
      );
    }

    this.render();
  }

  getData() {
    const { attacker, defender } = this.modalData;

    attacker.isReady = !!attacker.result;

    defender.isReady = !!defender.result;

    if (attacker.result && defender.result) {
      const attackerTotal =
        attacker.result.values.total + this.modalData.attacker.customModifier;
      const defenderTotal =
        defender.result.values.total + this.modalData.defender.customModifier;

      const winner = attackerTotal > defenderTotal ? attacker.token : defender.token;

      if (this.isDamagingCombat) {
        const combatResult = calculateCombatResult(
          Math.max(attackerTotal, 0),
          Math.max(defenderTotal, 0),
          Math.max(
            defender.result.values.at - calculateATReductionByQuality(attacker.result),
            0
          ),
          attacker.result.values.damage,
          defender.result.type === 'resistance' ? defender.result.values.surprised : false
        );

        if (combatResult.canCounterAttack) {
          this.modalData.calculations = {
            difference: attackerTotal - defenderTotal,
            canCounter: true,
            winner,
            counterAttackBonus: combatResult.counterAttackBonus
          };
        } else {
          this.modalData.calculations = {
            difference: attackerTotal - defenderTotal,
            canCounter: false,
            winner,
            damage: combatResult.damage
          };
        }
      } else {
        this.modalData.calculations = {
          difference: attackerTotal - defenderTotal,
          canCounter: false,
          winner
        };
      }
    }

    return this.modalData;
  }

  async _updateObject(event, formData) {
    this.modalData = mergeObject(this.modalData, formData);

    this.render();
  }

  applyValuesIfBeAble() {
    if (this.modalData.attacker.result?.type === 'combat') {
      this.attackerActor.applyFatigue(this.modalData.attacker.result.values.fatigueUsed);
    }

    if (this.modalData.defender.result?.type === 'combat') {
      this.defenderActor.applyFatigue(this.modalData.defender.result.values.fatigue);
    }
  }
}
