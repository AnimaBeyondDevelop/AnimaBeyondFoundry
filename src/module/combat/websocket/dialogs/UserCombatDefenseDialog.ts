import { ABFActor } from '../../../actor/ABFActor';
import { Templates } from '../../../utils/constants';
import ABFFoundryRoll from '../../../rolls/ABFFoundryRoll';
import { WeaponCritic } from '../../../types/combat/WeaponItemConfig';

type UserCombatDefenseDialogData = {
  attacker: {
    actor: ABFActor;
    critic: WeaponCritic;
  };
  defender: { actor: ABFActor; modifier?: number; fatigue?: number; defenseCount?: number };
  defenseSent?: boolean;
};

export type UserCombatDefenseValues = {
  defense: number;
  at: number;
};

export class UserCombatDefenseDialog extends FormApplication<FormApplication.Options, UserCombatDefenseDialogData> {
  private data: UserCombatDefenseDialogData;

  constructor(
    data: UserCombatDefenseDialogData,
    private hooks: {
      onDefense: (attackValues: UserCombatDefenseValues) => void;
    }
  ) {
    super(data);

    this.data = data;

    this.render(true);
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['user-combat-attack-dialog'],
      submitOnChange: true,
      closeOnSubmit: false,
      width: 525,
      height: 240,
      template: Templates.Dialog.Combat.UserCombatDefenseDialog,
      title: 'Defending'
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
      const { fatigue, modifier, defenseCount } = this.data.defender;

      const value =
        e.currentTarget.dataset.type === 'dodge'
          ? this.defender.data.data.combat.dodge.final.value
          : this.defender.data.data.combat.block.final.value;

      const roll = new ABFFoundryRoll(
        `1d100xa + ${modifier ?? 0} + ${fatigue ?? 0}*15 - ${defenseCount ?? 0} + ${value}`
      );
      roll.roll();

      let at;

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
          this.close({ force: true });
          ui.notifications?.error(
            'Cant send defense because the attack has no critic, so I cant calculate the armor type used to defend'
          );
          return;
      }

      this.hooks.onDefense({
        defense: roll.total!,
        at
      });

      this.data.defenseSent = true;

      this.setPosition({
        width: 525,
        height: 300
      });

      this.render();
    });
  }
  getData(): Promise<UserCombatDefenseDialogData> | UserCombatDefenseDialogData {
    return this.data;
  }

  async _updateObject(event, formData) {
    this.data = mergeObject(this.data, formData);
  }
}
