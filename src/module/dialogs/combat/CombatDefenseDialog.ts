import { Templates } from '../../utils/constants';
import ABFFoundryRoll from '../../rolls/ABFFoundryRoll';
import { WeaponCritic, WeaponDataSource } from '../../types/combat/WeaponItemConfig';
import { UserCombatAttackResult } from './CombatAttackDialog';
import { SpellDataSource } from '../../types/mystic/SpellItemConfig';
import { PsychicPowerDataSource } from '../../types/psychic/PsychicPowerItemConfig';
import { ABFActor } from '../../actor/ABFActor';
import { ABFSettingsKeys } from '../../../utils/registerSettings';

type SpecialField = {
  special: number;
  final: number;
};

export type UserCombatDefenseDialogData = {
  ui: {
    isGM: boolean;
    hasFatiguePoints: boolean;
  };
  attacker: {
    actor: ABFActor;
    token: TokenDocument;
    attackType: UserCombatAttackResult['type'];
    critic?: WeaponCritic;
  };
  defender: {
    actor: ABFActor;
    token: TokenDocument;
    showRoll: boolean;
    combat: {
      modifier: number;
      fatigue: number;
      weaponUsed: string | undefined;
      weapon: WeaponDataSource | undefined;
      unarmed: boolean
      multipleDefensesPenalty: number;
      at: SpecialField;
    };
    mystic: {
      modifier: number;
      magicProjectionType: 'normal' | 'defensive';
      spellUsed: string | undefined;
      spellGrade: 'base' | 'intermediate' | 'advanced' | 'arcane';
    };
    psychic: {
      modifier: number;
      psychicProjection: number;
      psychicPotential: SpecialField;
      powerUsed: string | undefined;
    };
  };
  defenseSent: boolean;
};

export type UserCombatDefenseCombatResult = {
  type: 'combat';
  values: {
    modifier: number;
    type: 'dodge' | 'block';
    fatigue: number;
    multipleDefensesPenalty: number;
    at: number | undefined;
    roll: number;
    total: number;
  };
};

export type UserCombatDefenseMysticResult = {
  type: 'mystic';
  values: {
    modifier: number;
    magicProjection: number;
    spellUsed: string;
    spellGrade: 'base' | 'intermediate' | 'advanced' | 'arcane';
    roll: number;
    total: number;
  };
};

export type UserCombatDefensePsychicResult = {
  type: 'psychic';
  values: {
    modifier: number;
    psychicProjection: number;
    psychicPotential: number;
    powerUsed: string;
    roll: number;
    total: number;
  };
};

export type UserCombatDefenseResult =
  | UserCombatDefenseCombatResult
  | UserCombatDefenseMysticResult
  | UserCombatDefensePsychicResult;

const getInitialData = (
  attacker: { token: TokenDocument; attackType: UserCombatAttackResult['type']; critic?: WeaponCritic },
  defender: TokenDocument
): UserCombatDefenseDialogData => {
  const showRollByDefault = !!(game as Game).settings.get(
    'animabf',
    ABFSettingsKeys.SEND_ROLL_MESSAGES_ON_COMBAT_BY_DEFAULT
  );
  const isGM = !!(game as Game).user?.isGM;

  const attackerActor = attacker.token.actor!;
  const defenderActor = defender.actor!;

  return {
    ui: {
      isGM,
      hasFatiguePoints: defenderActor.data.data.characteristics.secondaries.fatigue.value > 0
    },
    attacker: {
      token: attacker.token,
      actor: attackerActor,
      attackType: attacker.attackType,
      critic: attacker.critic
    },
    defender: {
      token: defender,
      actor: defenderActor,
      showRoll: !isGM || showRollByDefault,
      combat: {
        fatigue: 0,
        multipleDefensesPenalty: 0,
        modifier: 0,
        weaponUsed: undefined,
        weapon: undefined,
        unarmed: false,
        at: {
          special: 0,
          final: 0
        }
      },
      mystic: {
        modifier: 0,
        magicProjectionType: 'normal',
        spellUsed: undefined,
        spellGrade: 'base'
      },
      psychic: {
        modifier: 0,
        psychicPotential: { special: 0, final: defenderActor.data.data.psychic.psychicPotential.final.value },
        psychicProjection: defenderActor.data.data.psychic.psychicProjection.final.value,
        powerUsed: undefined
      }
    },
    defenseSent: false
  };
};

export class CombatDefenseDialog extends FormApplication<FormApplication.Options, UserCombatDefenseDialogData> {
  private data: UserCombatDefenseDialogData;

  constructor(
    attacker: { token: TokenDocument; attackType: UserCombatAttackResult['type']; critic?: WeaponCritic },
    defender: TokenDocument,
    private hooks: {
      onDefense: (attackValues: UserCombatDefenseResult) => void;
    }
  ) {
    super(getInitialData(attacker, defender));

    this.data = getInitialData(attacker, defender);

    const weapons = this.defenderActor.data.data.combat.weapons as WeaponDataSource[];

    if (weapons.length > 0) {
      this.data.defender.combat.weaponUsed = weapons[0]._id;
    } else {
      this.data.defender.combat.unarmed = true;
    }

    this.render(true);
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['abf-dialog combat-defense-dialog no-close'],
      submitOnChange: true,
      closeOnSubmit: false,
      width: 525,
      height: 240,
      resizable: true,
      template: Templates.Dialog.Combat.CombatDefenseDialog.main,
      title: (game as Game).i18n.localize('macros.combat.dialog.defending.defend.title'),
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
    return this.data.attacker.token.actor!;
  }

  get defenderActor() {
    return this.data.defender.token.actor!;
  }

  async close(options?: FormApplication.CloseOptions): Promise<void> {
    if (options?.force) {
      return super.close(options);
    }

    // eslint-disable-next-line no-useless-return,consistent-return
    return;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find('.send-defense').click(e => {
      const { fatigue, modifier, weapon, multipleDefensesPenalty, at } = this.data.defender.combat;

      const type = e.currentTarget.dataset.type === 'dodge' ? 'dodge' : 'block';

      let value: number;
      if (e.currentTarget.dataset.type === 'dodge') {
        value = this.defenderActor.data.data.combat.dodge.final.value;
      } else {
        value = weapon ? weapon.data.block.final.value : this.defenderActor.data.data.combat.block.final.value;
      }

      const roll = new ABFFoundryRoll(
        `1d100xa + ${modifier ?? 0} + ${fatigue ?? 0} * 15 - ${(multipleDefensesPenalty ?? 0) * -1} + ${value}`
      );

      roll.roll();

      if (this.data.defender.showRoll) {
        const { i18n } = game as Game;

        const flavor = i18n.format(`macros.combat.dialog.physicalDefense.${type}.title`, {
          target: this.data.attacker.token.name
        });

        roll.toMessage({
          speaker: ChatMessage.getSpeaker({ token: this.data.defender.token }),
          flavor
        });
      }

      const rolled = roll.total! - (modifier ?? 0) - (fatigue ?? 0) * 15 - (multipleDefensesPenalty ?? 0) - value;

      this.hooks.onDefense({
        type: 'combat',
        values: {
          type,
          multipleDefensesPenalty,
          modifier,
          fatigue,
          at: at.final,
          roll: rolled,
          total: roll.total!
        }
      });

      this.data.defenseSent = true;

      this.render();
    });

    html.find('.send-mystic-defense').click(() => {
      const { modifier, spellUsed, spellGrade, magicProjectionType } = this.data.defender.mystic;

      if (spellUsed) {
        const magicProjection =
          magicProjectionType === 'normal'
            ? this.defenderActor.data.data.mystic.magicProjection.final.value
            : this.defenderActor.data.data.mystic.magicProjection.imbalance.defensive.final.value;

        const roll = new ABFFoundryRoll(`1d100xa + ${magicProjection} + ${modifier ?? 0}`);
        roll.roll();

        if (this.data.defender.showRoll) {
          const { i18n } = game as Game;

          const spells = this.defenderActor.data.data.mystic.spells as SpellDataSource[];

          const spell = spells.find(w => w._id === spellUsed)!;

          const flavor = i18n.format('macros.combat.dialog.magicDefense.title', {
            spell: spell.name,
            target: this.data.attacker.token.name
          });

          roll.toMessage({
            speaker: ChatMessage.getSpeaker({ token: this.data.defender.token }),
            flavor
          });
        }

        const rolled = roll.total! - magicProjection - (modifier ?? 0);

        this.hooks.onDefense({
          type: 'mystic',
          values: {
            modifier,
            magicProjection,
            spellGrade,
            spellUsed,
            roll: rolled,
            total: roll.total!
          }
        });

        this.data.defenseSent = true;

        this.render();
      }
    });

    html.find('.send-psychic-defense').click(() => {
      const { psychicProjection, psychicPotential, powerUsed, modifier } = this.data.defender.psychic;

      if (powerUsed) {
        const roll = new ABFFoundryRoll(`1d100xa + ${psychicProjection} + ${modifier ?? 0}`);
        roll.roll();

        if (this.data.defender.showRoll) {
          const { i18n } = game as Game;

          const powers = this.defenderActor.data.data.psychic.psychicPowers as PsychicPowerDataSource[];

          const power = powers.find(w => w._id === powerUsed)!;

          const flavor = i18n.format('macros.combat.dialog.psychicDefense.title', {
            power: power.name,
            target: this.data.attacker.token.name
          });

          roll.toMessage({
            speaker: ChatMessage.getSpeaker({ token: this.data.defender.token }),
            flavor
          });
        }

        const rolled = roll.total! - psychicProjection - (modifier ?? 0);

        this.hooks.onDefense({
          type: 'psychic',
          values: {
            modifier,
            powerUsed,
            psychicProjection,
            psychicPotential: psychicPotential.final,
            roll: rolled,
            total: roll.total!
          }
        });

        this.data.defenseSent = true;

        this.render();
      }
    });
  }
  getData(): Promise<UserCombatDefenseDialogData> | UserCombatDefenseDialogData {
    this.data.ui.hasFatiguePoints = this.defenderActor.data.data.characteristics.secondaries.fatigue.value > 0;

    this.data.defender.psychic.psychicPotential.final =
      this.data.defender.psychic.psychicPotential.special +
      this.defenderActor.data.data.psychic.psychicPotential.final.value;

    let at;

    if (this.data.attacker.attackType === 'combat') {
      switch (this.data.attacker.critic) {
        case WeaponCritic.CUT:
          at = this.defenderActor.data.data.combat.totalArmor.at.cut.value;
          break;
        case WeaponCritic.IMPACT:
          at = this.defenderActor.data.data.combat.totalArmor.at.impact.value;
          break;
        case WeaponCritic.THRUST:
          at = this.defenderActor.data.data.combat.totalArmor.at.thrust.value;
          break;
        case WeaponCritic.HEAT:
          at = this.defenderActor.data.data.combat.totalArmor.at.heat.value;
          break;
        case WeaponCritic.ELECTRICITY:
          at = this.defenderActor.data.data.combat.totalArmor.at.electricity.value;
          break;
        case WeaponCritic.COLD:
          at = this.defenderActor.data.data.combat.totalArmor.at.cold.value;
          break;
        case WeaponCritic.ENERGY:
          at = this.defenderActor.data.data.combat.totalArmor.at.energy.value;
          break;
        default:
          at = undefined;
      }
    }

    if (at !== undefined) {
      this.data.defender.combat.at.final = this.data.defender.combat.at.special + at;
    }

    const { combat } = this.data.defender;

    const weapons = this.defenderActor.data.data.combat.weapons as WeaponDataSource[];
    combat.weapon = weapons.find(w => w._id === combat.weaponUsed)!;

    return this.data;
  }

  async _updateObject(event, formData) {
    this.data = mergeObject(this.data, formData);

    this.render();
  }
}
