import { ABFActor } from '../../actor/ABFActor';
import { Templates } from '../../utils/constants';
import ABFFoundryRoll from '../../rolls/ABFFoundryRoll';
import { WeaponCritic } from '../../types/combat/WeaponItemConfig';
import { UserCombatAttackResult } from './CombatAttackDialog';

type SpecialField = {
  special: number;
  final: number;
};

export type UserCombatDefenseDialogData = {
  ui: {
    hasFatiguePoints: boolean;
  };
  attacker: {
    actor: ABFActor;
    attackType: UserCombatAttackResult['type'];
    critic?: WeaponCritic;
  };
  defender: {
    actor: ABFActor;
    combat: {
      modifier: number;
      fatigue: number;
      defenseCount: number;
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
    defenseCount: number;
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
  attacker: { actor: ABFActor; attackType: UserCombatAttackResult['type']; critic?: WeaponCritic },
  defender: ABFActor
): UserCombatDefenseDialogData => ({
  ui: {
    hasFatiguePoints: defender.data.data.characteristics.secondaries.fatigue.value > 0
  },
  attacker: {
    actor: attacker.actor,
    attackType: attacker.attackType,
    critic: attacker.critic
  },
  defender: {
    actor: defender,
    combat: {
      fatigue: 0,
      defenseCount: 1,
      modifier: 0,
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
      psychicPotential: { special: 0, final: defender.data.data.psychic.psychicPotential.final.value },
      psychicProjection: defender.data.data.psychic.psychicProjection.final.value,
      powerUsed: undefined
    }
  },
  defenseSent: false
});

export class CombatDefenseDialog extends FormApplication<FormApplication.Options, UserCombatDefenseDialogData> {
  private data: UserCombatDefenseDialogData;

  constructor(
    attacker: { actor: ABFActor; attackType: UserCombatAttackResult['type']; critic?: WeaponCritic },
    defender: ABFActor,
    private hooks: {
      onDefense: (attackValues: UserCombatDefenseResult) => void;
    }
  ) {
    super(getInitialData(attacker, defender));

    this.data = getInitialData(attacker, defender);

    this.render(true);
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['abf-dialog combat-defense-dialog'],
      submitOnChange: true,
      closeOnSubmit: false,
      width: 525,
      height: 240,
      resizable: true,
      template: Templates.Dialog.Combat.CombatDefenseDialog.main,
      title: 'Defending',
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-body',
          initial: 'combat'
        }
      ]
    });
  }

  get attacker() {
    return this.data.attacker.actor;
  }

  get defender() {
    return this.data.defender.actor;
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
      const { fatigue, modifier, defenseCount, at } = this.data.defender.combat;

      const type = e.currentTarget.dataset.type === 'dodge' ? 'dodge' : 'block';

      const value =
        e.currentTarget.dataset.type === 'dodge'
          ? this.defender.data.data.combat.dodge.final.value
          : this.defender.data.data.combat.block.final.value;

      const roll = new ABFFoundryRoll('1d100xa');
      roll.roll();

      const total = roll.total! + (modifier ?? 0) + (fatigue ?? 0) * 15 - (defenseCount ?? 0) + value;

      this.hooks.onDefense({
        type: 'combat',
        values: {
          type,
          defenseCount,
          modifier,
          fatigue,
          at: at.final,
          roll: roll.total!,
          total
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
            ? this.attacker.data.data.mystic.magicProjection.final.value
            : this.attacker.data.data.mystic.magicProjection.imbalance.defensive.final.value;

        const roll = new ABFFoundryRoll('1d100xa');
        roll.roll();

        const total = roll.total! + (modifier ?? 0);

        this.hooks.onDefense({
          type: 'mystic',
          values: {
            modifier,
            magicProjection,
            spellGrade,
            spellUsed,
            roll: roll.total!,
            total
          }
        });

        this.data.defenseSent = true;

        this.render();
      }
    });

    html.find('.send-psychic-defense').click(() => {
      const { psychicProjection, psychicPotential, powerUsed, modifier } = this.data.defender.psychic;

      if (powerUsed) {
        const roll = new ABFFoundryRoll('1d100xa');
        roll.roll();

        const total = roll.total! + (modifier ?? 0);

        this.hooks.onDefense({
          type: 'psychic',
          values: {
            modifier,
            powerUsed,
            psychicProjection,
            psychicPotential: psychicPotential.final,
            roll: roll.total!,
            total
          }
        });

        this.data.defenseSent = true;

        this.render();
      }
    });
  }
  getData(): Promise<UserCombatDefenseDialogData> | UserCombatDefenseDialogData {
    this.data.ui.hasFatiguePoints = this.defender.data.data.characteristics.secondaries.fatigue.value > 0;

    this.data.defender.psychic.psychicPotential.final =
      this.data.defender.psychic.psychicPotential.special +
      this.defender.data.data.psychic.psychicPotential.final.value;

    let at;

    if (this.data.attacker.attackType === 'combat') {
      switch (this.data.attacker.critic) {
        case WeaponCritic.CUT:
          at = this.defender.data.data.combat.totalArmor.at.cut.value;
          break;
        case WeaponCritic.IMPACT:
          at = this.defender.data.data.combat.totalArmor.at.impact.value;
          break;
        case WeaponCritic.THRUST:
          at = this.defender.data.data.combat.totalArmor.at.thrust.value;
          break;
        case WeaponCritic.HEAT:
          at = this.defender.data.data.combat.totalArmor.at.heat.value;
          break;
        case WeaponCritic.ELECTRICITY:
          at = this.defender.data.data.combat.totalArmor.at.electricity.value;
          break;
        case WeaponCritic.COLD:
          at = this.defender.data.data.combat.totalArmor.at.cold.value;
          break;
        case WeaponCritic.ENERGY:
          at = this.defender.data.data.combat.totalArmor.at.energy.value;
          break;
        default:
          at = undefined;
      }
    }

    if (at !== undefined) {
      this.data.defender.combat.at.final = this.data.defender.combat.at.special + at;
    }

    return this.data;
  }

  async _updateObject(event, formData) {
    this.data = mergeObject(this.data, formData);

    this.render();
  }
}
