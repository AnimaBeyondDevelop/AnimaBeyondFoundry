import { Templates } from '../../utils/constants';
import { NoneWeaponCritic, WeaponCritic, WeaponDataSource } from '../../types/combat/WeaponItemConfig';
import ABFFoundryRoll from '../../rolls/ABFFoundryRoll';
import { SpellDataSource } from '../../types/mystic/SpellItemConfig';
import { PsychicPowerDataSource } from '../../types/psychic/PsychicPowerItemConfig';
import { ABFSettingsKeys } from '../../../utils/registerSettings';
import { ABFActor } from '../../actor/ABFActor';

type SpecialField = {
  special: number;
  final: number;
};

export type UserCombatAttackDialogData = {
  ui: {
    isGM: boolean;
    hasFatiguePoints: boolean;
    weaponHasSecondaryCritic: boolean | undefined;
  };
  attacker: {
    actor: ABFActor;
    token: TokenDocument;
    showRoll: boolean;
    counterAttackBonus: number | undefined;
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
  defender: { actor: ABFActor; token: TokenDocument };
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

const getInitialData = (
  attacker: TokenDocument,
  defender: TokenDocument,
  options: { allowed?: boolean; counterAttackBonus?: number } = {}
): UserCombatAttackDialogData => {
  const showRollByDefault = !!(game as Game).settings.get(
    'animabf',
    ABFSettingsKeys.SEND_ROLL_MESSAGES_ON_COMBAT_BY_DEFAULT
  );
  const isGM = !!(game as Game).user?.isGM;

  const attackerActor = attacker.actor!;
  const defenderActor = defender.actor!;

  return {
    ui: {
      isGM,
      hasFatiguePoints: attackerActor.data.data.characteristics.secondaries.fatigue.value > 0,
      weaponHasSecondaryCritic: undefined
    },
    attacker: {
      token: attacker,
      actor: attackerActor,
      showRoll: !isGM || showRollByDefault,
      counterAttackBonus: options.counterAttackBonus,
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
        psychicProjection: attackerActor.data.data.psychic.psychicProjection.final.value,
        psychicPotential: { special: 0, final: attackerActor.data.data.psychic.psychicProjection.final.value },
        powerUsed: undefined
      }
    },
    defender: {
      token: defender,
      actor: defenderActor
    },
    attackSent: false,
    allowed: false
  };
};

export class CombatAttackDialog extends FormApplication<FormApplication.Options, UserCombatAttackDialogData> {
  private data: UserCombatAttackDialogData;

  constructor(
    attacker: TokenDocument,
    defender: TokenDocument,
    private hooks: {
      onAttack: (attackValues: UserCombatAttackResult) => void;
    },
    options: { allowed?: boolean; counterAttackBonus?: number } = {}
  ) {
    super(getInitialData(attacker, defender, options));

    this.data = getInitialData(attacker, defender, options);

    const weapons = this.attackerActor.data.data.combat.weapons as WeaponDataSource[];

    if (weapons.length > 0) {
      this.data.attacker.combat.weaponUsed = weapons[0]._id;
    } else {
      this.data.attacker.combat.unarmed = true;
    }

    this.data.allowed = (game as Game).user?.isGM || (options.allowed ?? false);

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
      title: (game as Game).i18n.localize('macros.combat.dialog.modal.attack.title'),
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
        const attack = weapon ? weapon.data.attack.final.value : this.attackerActor.data.data.combat.attack.final.value;

        const counterAttackBonus = this.data.attacker.counterAttackBonus ?? 0;

        const roll = new ABFFoundryRoll(
          `1d100xa + ${counterAttackBonus} + ${attack} + ${modifier ?? 0} + ${fatigueUsed ?? 0}* 15`
        );

        roll.roll();

        if (this.data.attacker.showRoll) {
          const { i18n } = game as Game;

          const flavor = weapon
            ? i18n.format('macros.combat.dialog.physicalAttack.title', {
                weapon: weapon?.name,
                target: this.data.defender.token.name
              })
            : i18n.format('macros.combat.dialog.physicalAttack.unarmed.title', {
                target: this.data.defender.token.name
              });

          roll.toMessage({
            speaker: ChatMessage.getSpeaker({ token: this.data.attacker.token }),
            flavor
          });
        }

        const critic = criticSelected ?? WeaponCritic.IMPACT;

        const rolled = roll.total! - counterAttackBonus - attack - (modifier ?? 0) - (fatigueUsed ?? 0) * 15;

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
            roll: rolled,
            total: roll.total!
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
            ? this.attackerActor.data.data.mystic.magicProjection.final.value
            : this.attackerActor.data.data.mystic.magicProjection.imbalance.offensive.final.value;

        const roll = new ABFFoundryRoll(`1d100xa + ${magicProjection} + ${modifier ?? 0}`);
        roll.roll();

        if (this.data.attacker.showRoll) {
          const { i18n } = game as Game;

          const spells = this.attackerActor.data.data.mystic.spells as SpellDataSource[];

          const spell = spells.find(w => w._id === spellUsed)!;

          const flavor = i18n.format('macros.combat.dialog.magicAttack.title', {
            spell: spell.name,
            target: this.data.defender.token.name
          });

          roll.toMessage({
            speaker: ChatMessage.getSpeaker({ token: this.data.attacker.token }),
            flavor
          });
        }

        const rolled = roll.total! - magicProjection - (modifier ?? 0);

        this.hooks.onAttack({
          type: 'mystic',
          values: {
            modifier,
            spellUsed,
            spellGrade,
            magicProjection,
            roll: rolled,
            total: roll.total!
          }
        });

        this.data.attackSent = true;

        this.render();
      }
    });

    html.find('.send-psychic-attack').click(() => {
      const { powerUsed, modifier, psychicPotential, psychicProjection } = this.data.attacker.psychic;

      if (powerUsed) {
        const psychicProjectionRoll = new ABFFoundryRoll(`1d100xa + ${psychicProjection} + ${modifier ?? 0}`);
        psychicProjectionRoll.roll();

        if (this.data.attacker.showRoll) {
          const { i18n } = game as Game;

          const powers = this.attackerActor.data.data.psychic.psychicPowers as PsychicPowerDataSource[];

          const power = powers.find(w => w._id === powerUsed)!;

          const flavor = i18n.format('macros.combat.dialog.psychicAttack.title', {
            power: power.name,
            target: this.data.defender.token.name
          });

          psychicProjectionRoll.toMessage({
            speaker: ChatMessage.getSpeaker({ token: this.data.attacker.token }),
            flavor
          });
        }

        const rolled = psychicProjectionRoll.total! - psychicProjection - (modifier ?? 0);

        const psychicPotentialRoll = new ABFFoundryRoll('1d100xa');
        psychicPotentialRoll.roll();

        this.hooks.onAttack({
          type: 'psychic',
          values: {
            modifier,
            powerUsed,
            psychicPotential: psychicPotential.final + psychicPotentialRoll.total!,
            psychicProjection,
            roll: rolled,
            total: psychicProjectionRoll.total!
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

    ui.hasFatiguePoints = this.attackerActor.data.data.characteristics.secondaries.fatigue.value > 0;

    psychic.psychicPotential.final =
      psychic.psychicPotential.special + this.attackerActor.data.data.psychic.psychicPotential.final.value;

    const weapons = this.attackerActor.data.data.combat.weapons as WeaponDataSource[];

    const weapon = weapons.find(w => w._id === combat.weaponUsed)!;

    combat.unarmed = weapons.length === 0;

    if (combat.unarmed) {
      combat.damage.final =
        combat.damage.special + 10 + this.attackerActor.data.data.characteristics.primaries.strength.mod;
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
