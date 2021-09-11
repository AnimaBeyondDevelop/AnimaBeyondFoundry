import { ABFActor } from '../../../actor/ABFActor';
import { Templates } from '../../../utils/constants';
import { NoneWeaponCritic, WeaponCritic, WeaponDataSource } from '../../../types/combat/WeaponItemConfig';
import ABFFoundryRoll from '../../../rolls/ABFFoundryRoll';

type UserCombatAttackDialogData = {
  attacker: {
    actor: ABFActor;
    modifier?: number;
    fatigueUsed?: number;
    weaponUsed?: string;
    weapon?: WeaponDataSource;
    criticSelected?: WeaponCritic;
    weaponHasSecondaryCritic?: boolean;
  };
  defender: { actor: ABFActor };
  attackSent?: boolean;
  allowed?: boolean;
};

export type UserCombatAttackValues = {
  attack: number;
  damage: number;
  critic: WeaponCritic;
};

export class UserCombatAttackDialog extends FormApplication<FormApplication.Options, UserCombatAttackDialogData> {
  private data: UserCombatAttackDialogData;

  constructor(
    data: UserCombatAttackDialogData,
    private hooks: {
      onAttack: (attackValues: UserCombatAttackValues) => void;
    }
  ) {
    super(data);

    this.data = data;

    const combat = this.attacker.data.data.combat as { weapons: WeaponDataSource[] };

    this.data.attacker.weaponUsed = combat.weapons[0]._id;

    this.render(true);
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['user-combat-attack-dialog'],
      submitOnChange: true,
      closeOnSubmit: false,
      template: Templates.Dialog.Combat.UserCombatAttackDialog,
      title: 'Attacking'
    });
  }

  get attacker() {
    return this.data.attacker.actor;
  }

  get defender() {
    return this.data.defender.actor;
  }

  public updatePermissions(allowed: boolean) {
    this.data.allowed = allowed;

    this.setPosition({ height: 250, width: 520 });

    this.render();
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

    html.find('.send-attack').click(() => {
      if (this.data.attacker.weapon && this.data.attacker.criticSelected) {
        const { weapon } = this.data.attacker;

        const roll = new ABFFoundryRoll(
          `1d100xa + ${weapon.data.attack.value} + ${this.data.attacker.modifier ?? 0} + ${
            this.data.attacker.fatigueUsed ?? 0
          }*15`
        );
        roll.roll();

        this.hooks.onAttack({
          attack: roll.total!,
          damage: weapon.data.damage.final.value,
          critic: this.data.attacker.criticSelected
        });

        this.data.attackSent = true;

        this.setPosition({
          width: 525,
          height: 300
        });

        this.render();
      }
    });
  }

  getData(): Promise<UserCombatAttackDialogData> | UserCombatAttackDialogData {
    if (this.data.attacker.weaponUsed) {
      const combat = this.attacker.data.data.combat as { weapons: WeaponDataSource[] };

      const weapon = combat.weapons.find(w => w._id === this.data.attacker.weaponUsed)!;

      this.data.attacker.weapon = weapon;

      if (weapon.data.critic.secondary.value === NoneWeaponCritic.NONE) {
        this.data.attacker.criticSelected = weapon.data.critic.primary.value;
        this.data.attacker.weaponHasSecondaryCritic = false;
      } else {
        this.data.attacker.weaponHasSecondaryCritic = true;
      }
    }

    return this.data;
  }

  async _updateObject(event, formData) {
    this.data = mergeObject(this.data, formData);

    this.render();
  }
}
