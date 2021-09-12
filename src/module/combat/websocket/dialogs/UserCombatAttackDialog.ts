import { ABFActor } from '../../../actor/ABFActor';
import { Templates } from '../../../utils/constants';
import { NoneWeaponCritic, WeaponCritic, WeaponDataSource } from '../../../types/combat/WeaponItemConfig';
import ABFFoundryRoll from '../../../rolls/ABFFoundryRoll';

type SpecialField = {
  special: number;
  final: number;
};

export type UserCombatAttackDialogData = {
  ui: {
    hasFatiguePoints: boolean;
    weaponHasSecondaryCritic: boolean | undefined;
  };
  attacker: {
    actor: ABFActor;
    combat: {
      modifier: number;
      fatigueUsed: number;
      unarmed: boolean;
      weaponUsed: string | undefined;
      weapon: WeaponDataSource | undefined;
      criticSelected: WeaponCritic | undefined;
      damage: SpecialField;
    };
    mystic: {
      modifier: number;
      magicProjectionType: 'normal' | 'offensive';
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
  defender: { actor: ABFActor };
  attackSent: boolean;
  allowed: boolean;
};

type UserCombatAttackCombatResult = {
  type: 'combat';
  values: {
    modifier: number;
    attack: number;
    fatigueUsed: number;
    unarmed: boolean;
    weaponUsed: string | undefined;
    criticSelected: WeaponCritic | undefined;
    damage: number;
    roll: number;
    total: number;
  };
};

type UserCombatAttackMysticResult = {
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

type UserCombatAttackPsychicResult = {
  type: 'psychic';
  values: {
    modifier: number;
    psychicProjection: number;
    psychicPotential: number;
    powerUsed: string | undefined;
    roll: number;
    total: number;
  };
};

export type UserCombatAttackResult =
  | UserCombatAttackCombatResult
  | UserCombatAttackMysticResult
  | UserCombatAttackPsychicResult;

const getInitialData = (attacker: ABFActor, defender: ABFActor): UserCombatAttackDialogData => ({
  ui: {
    hasFatiguePoints: attacker.data.data.characteristics.secondaries.fatigue.value > 0,
    weaponHasSecondaryCritic: undefined
  },
  attacker: {
    actor: attacker,
    combat: {
      fatigueUsed: 0,
      modifier: 0,
      unarmed: false,
      weaponUsed: undefined,
      criticSelected: undefined,
      weapon: undefined,
      damage: { special: 0, final: 0 }
    },
    mystic: {
      modifier: 0,
      magicProjectionType: 'normal',
      spellUsed: undefined,
      spellGrade: 'base'
    },
    psychic: {
      modifier: 0,
      psychicProjection: attacker.data.data.psychic.psychicProjection.final.value,
      psychicPotential: { special: 0, final: attacker.data.data.psychic.psychicProjection.final.value },
      powerUsed: undefined
    }
  },
  defender: {
    actor: defender
  },
  attackSent: false,
  allowed: false
});

export class UserCombatAttackDialog extends FormApplication<FormApplication.Options, UserCombatAttackDialogData> {
  private data: UserCombatAttackDialogData;

  constructor(
    attacker: ABFActor,
    defender: ABFActor,
    private hooks: {
      onAttack: (attackValues: UserCombatAttackResult) => void;
    },
    allowed = false
  ) {
    super(getInitialData(attacker, defender));

    this.data = getInitialData(attacker, defender);

    const weapons = this.attacker.data.data.combat.weapons as WeaponDataSource[];

    if (weapons.length > 0) {
      this.data.attacker.combat.weaponUsed = weapons[0]._id;
    } else {
      this.data.attacker.combat.unarmed = true;
    }

    this.data.allowed = (game as Game).user?.isGM || allowed;

    this.render(true);
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['user-combat-attack-dialog'],
      submitOnChange: true,
      closeOnSubmit: false,
      width: null,
      height: null,
      resizable: true,
      template: Templates.Dialog.Combat.UserCombatAttackDialog.main,
      title: 'Attacking',
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

  public updatePermissions(allowed: boolean) {
    this.data.allowed = allowed;

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
      const { weapon, criticSelected, modifier, fatigueUsed, damage, weaponUsed, unarmed } = this.data.attacker.combat;

      if (typeof damage !== 'undefined') {
        const roll = new ABFFoundryRoll('1d100xa');

        roll.roll();

        const attack = weapon ? weapon.data.attack.value : this.attacker.data.data.combat.attack.final.value;
        const critic = criticSelected ?? WeaponCritic.IMPACT;

        const total = roll.total! + attack + (modifier ?? 0) + (fatigueUsed ?? 0) * 15;

        this.hooks.onAttack({
          type: 'combat',
          values: {
            unarmed,
            damage: damage.final,
            attack,
            weaponUsed,
            criticSelected: critic,
            modifier,
            fatigueUsed,
            roll: roll.total!,
            total
          }
        });

        this.data.attackSent = true;

        this.render();
      }
    });

    html.find('.send-mystic-attack').click(() => {
      const { magicProjectionType, spellGrade, spellUsed, modifier } = this.data.attacker.mystic;

      if (spellUsed) {
        const magicProjection =
          magicProjectionType === 'normal'
            ? this.attacker.data.data.mystic.magicProjection.final.value
            : this.attacker.data.data.mystic.magicProjection.imbalance.offensive.final.value;

        const roll = new ABFFoundryRoll('1d100xa');
        roll.roll();

        const total = roll.total! + magicProjection + (modifier ?? 0);

        this.hooks.onAttack({
          type: 'mystic',
          values: {
            modifier,
            spellUsed,
            spellGrade,
            magicProjection,
            roll: roll.total!,
            total
          }
        });

        this.data.attackSent = true;

        this.render();
      }
    });

    html.find('.send-psychic-attack').click(() => {
      const { powerUsed, modifier, psychicPotential, psychicProjection } = this.data.attacker.psychic;

      if (powerUsed) {
        const psychicProjectionRoll = new ABFFoundryRoll('1d100xa');
        psychicProjectionRoll.roll();

        const total = psychicProjectionRoll.total! + psychicProjection + (modifier ?? 0);

        const psychicPotentialRoll = new ABFFoundryRoll('1d100xa');
        psychicPotentialRoll.roll();

        this.hooks.onAttack({
          type: 'psychic',
          values: {
            modifier,
            powerUsed,
            psychicPotential: psychicPotential.final + psychicPotentialRoll.total!,
            psychicProjection,
            roll: psychicProjectionRoll.total!,
            total
          }
        });

        this.data.attackSent = true;

        this.render();
      }
    });
  }

  getData(): Promise<UserCombatAttackDialogData> | UserCombatAttackDialogData {
    const {
      attacker: { combat, psychic },
      ui
    } = this.data;

    ui.hasFatiguePoints = this.attacker.data.data.characteristics.secondaries.fatigue.value > 0;

    psychic.psychicPotential.final =
      psychic.psychicPotential.special + this.attacker.data.data.psychic.psychicPotential.final.value;

    const weapons = this.attacker.data.data.combat.weapons as WeaponDataSource[];

    const weapon = weapons.find(w => w._id === combat.weaponUsed)!;

    combat.unarmed = weapons.length === 0;

    if (combat.unarmed) {
      combat.damage.final = combat.damage.special + 10;
    } else {
      combat.weapon = weapon;

      if (!combat.criticSelected) {
        combat.criticSelected = weapon.data.critic.primary.value;
      }

      ui.weaponHasSecondaryCritic = weapon.data.critic.secondary.value !== NoneWeaponCritic.NONE;

      combat.damage.final = combat.damage.special + weapon.data.damage.final.value;
    }

    return this.data;
  }

  async _updateObject(event, formData) {
    const prevWeapon = this.data.attacker.combat.weaponUsed;

    this.data = mergeObject(this.data, formData);

    if (prevWeapon !== this.data.attacker.combat.weaponUsed) {
      this.data.attacker.combat.criticSelected = undefined;
    }

    this.render();
  }
}
