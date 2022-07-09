import { Templates } from '../../utils/constants';
import ABFFoundryRoll from '../../rolls/ABFFoundryRoll';
import {
  NoneWeaponCritic,
  OptionalWeaponCritic,
  WeaponCritic,
  WeaponDataSource
} from '../../types/combat/WeaponItemConfig';
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
    activeTab: string;
  };
  attacker: {
    actor: ABFActor;
    token: TokenDocument;
    attackType: UserCombatAttackResult['type'];
    critic?: OptionalWeaponCritic;
  };
  defender: {
    actor: ABFActor;
    token: TokenDocument;
    showRoll: boolean;
    withoutRoll: boolean;
    combat: {
      modifier: number;
      fatigue: number;
      weaponUsed: string | undefined;
      weapon: WeaponDataSource | undefined;
      unarmed: boolean;
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
    resistance: {
      surprised: boolean;
    }
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
    defense: number;
    roll: number;
    total: number;
  };
};

export type UserDamageResistanceDefenseCombatResult = {
  type: 'resistance';
  values: {
    at: number | undefined;
    surprised: boolean;
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
    at: number | undefined;
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
    at: number | undefined;
    roll: number;
    total: number;
  };
};

export type UserCombatDefenseResult =
  | UserCombatDefenseCombatResult
  | UserCombatDefenseMysticResult
  | UserCombatDefensePsychicResult
  | UserDamageResistanceDefenseCombatResult;

const getInitialData = (
  attacker: { token: TokenDocument; attackType: UserCombatAttackResult['type']; critic?: OptionalWeaponCritic },
  defender: TokenDocument
): UserCombatDefenseDialogData => {
  const showRollByDefault = !!(game as Game).settings.get(
    'animabf',
    ABFSettingsKeys.SEND_ROLL_MESSAGES_ON_COMBAT_BY_DEFAULT
  );
  const isGM = !!(game as Game).user?.isGM;

  const attackerActor = attacker.token.actor!;
  const defenderActor = defender.actor!;

  const activeTab = (defenderActor.data.data.general.settings.defenseType.value === 'resistance') ? 'damageResistance' : 'combat'

  return {
    ui: {
      isGM,
      hasFatiguePoints: defenderActor.data.data.characteristics.secondaries.fatigue.value > 0,
      activeTab: activeTab
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
      withoutRoll: (defenderActor.data.data.general.settings.defenseType.value === 'mass') ? true : false,
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
        psychicProjection: defenderActor.data.data.psychic.psychicProjection.imbalance.defensive.final.value,
        powerUsed: undefined
      },
      resistance: {
        surprised: false
      }
    },
    defenseSent: false
  };
};

export class CombatDefenseDialog extends FormApplication<FormApplicationOptions, UserCombatDefenseDialogData> {
  private data: UserCombatDefenseDialogData;

  constructor(
    attacker: { token: TokenDocument; attackType: UserCombatAttackResult['type']; critic?: OptionalWeaponCritic },
    defender: TokenDocument,
    private hooks: {
      onDefense: (attackValues: UserCombatDefenseResult) => void;
    }
  ) {
    super(getInitialData(attacker, defender));

    this.data = getInitialData(attacker, defender);
    this._tabs[0].callback = (event: MouseEvent | null, tabs: Tabs, tabName: string) => {
      this.data.ui.activeTab = tabName;
      this.render(true);
    }
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

      let value: number, baseDefense: number;
      if (e.currentTarget.dataset.type === 'dodge') {
        value = this.defenderActor.data.data.combat.dodge.final.value;
        baseDefense = this.defenderActor.data.data.combat.dodge.base.value;
      } else {
        value = weapon ? weapon.data.block.final.value : this.defenderActor.data.data.combat.block.final.value;
        baseDefense = this.defenderActor.data.data.combat.block.base.value;
      }

      let formula = `1d100xa + ${modifier ?? 0} + ${fatigue ?? 0} * 15 - ${(multipleDefensesPenalty ?? 0) * -1} + ${value}`;
      if (this.data.defender.withoutRoll) { //Remove the dice from the formula
        formula = formula.replace('1d100xa', '0');
      }
      if (baseDefense >= 200) //Mastery reduces the fumble range
        formula = formula.replace('xa', 'xamastery');
          
      const roll = new ABFFoundryRoll(
        formula,
        this.defenderActor.data.data
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
          defense: value,
          roll: rolled,
          total: roll.total!
        }
      });

      this.data.defenseSent = true;

      this.render();
    });

    html.find('.send-defense-damage-resistance').click(e => {
      const at = this.data.defender.combat.at;
      const surprised = this.data.defender.resistance.surprised;
      this.hooks.onDefense({
        type: 'resistance',
        values: {
          at: at.final,
          surprised: surprised,
          total: 0
        }
      });

      this.data.defenseSent = true;

      this.render();
    });

    html.find('.send-mystic-defense').click(() => {
      const { modifier, spellUsed, spellGrade } = this.data.defender.mystic;
      const at = this.data.defender.combat.at;

      if (spellUsed) {
        let magicProjection = this.defenderActor.data.data.mystic.magicProjection.imbalance.defensive.final.value;
        let baseMagicProjection = this.defenderActor.data.data.mystic.magicProjection.imbalance.defensive.base.value;

        let formula = `1d100xa + ${magicProjection} + ${modifier ?? 0}`;
        if (this.data.defender.withoutRoll) { //Remove the dice from the formula
          formula = formula.replace('1d100xa', '0');
        }
        if (baseMagicProjection >= 200) //Mastery reduces the fumble range
          formula = formula.replace('xa', 'xamastery');

        const roll = new ABFFoundryRoll(formula, this.attackerActor.data.data);
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
            at: at.final,
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
      const at = this.data.defender.combat.at;

      if (powerUsed) {
        let formula = `1d100xa + ${psychicProjection} + ${modifier ?? 0}`;
        if (this.data.defender.withoutRoll) { //Remove the dice from the formula
          formula = formula.replace('1d100xa', '0');
        }
        if (this.defenderActor.data.data.psychic.psychicProjection.base.value >= 200) //Mastery reduces the fumble range
          formula = formula.replace('xa', 'xamastery');

        const roll = new ABFFoundryRoll(formula, this.defenderActor.data.data);
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
            at: at.final,
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

    if (this.data.attacker.critic !== NoneWeaponCritic.NONE) {
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
