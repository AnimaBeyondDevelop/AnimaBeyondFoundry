import { ABFActor } from '../../../actor/ABFActor';
import { calculateDamage } from '../../../macros/damageCalculator/damageCalculatorFunction';

type GMCombatDialogData = {
  attacker: { actor: ABFActor; attack?: number; damage?: number; isReady?: boolean };
  defender: { actor: ABFActor; defense?: number; at?: number; isReady?: boolean };
  calculations?: { canCounter: boolean; value: number };
};

export class GMCombatDialog extends FormApplication<FormApplication.Options, GMCombatDialogData> {
  private data: GMCombatDialogData;

  constructor(data: GMCombatDialogData, private hooks: { onClose: () => Promise<void> | void }) {
    super(data);

    this.data = data;

    this.render(true);
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['gm-combat-dialog'],
      submitOnChange: true,
      closeOnSubmit: false,
      height: 600,
      width: 700,
      template: 'systems/animabf/templates/dialog/combat/gm-combat-dialog.hbs',
      title: 'GM Combat'
    });
  }

  get attacker() {
    return this.data.attacker.actor;
  }

  get defender() {
    return this.data.defender.actor;
  }

  async close(): Promise<void> {
    await this.hooks.onClose();

    return super.close();
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find('.cancel-button').click(() => {
      this.close();
    });
  }

  updateAttackerData(attack: number, damage: number) {
    this.data.attacker.attack = attack;
    this.data.attacker.damage = damage;

    this.render();
  }

  updateDefenderData(defense: number, at: number) {
    this.data.defender.defense = defense;
    this.data.defender.at = at;

    this.render();
  }

  getData(): Promise<GMCombatDialogData> | GMCombatDialogData {
    const { attacker, defender } = this.data;

    attacker.isReady = typeof attacker.attack !== 'undefined' && typeof attacker.damage !== 'undefined';

    defender.isReady = typeof defender.defense !== 'undefined' && typeof defender.at !== 'undefined';

    if (defender.isReady && attacker.isReady) {
      const result = calculateDamage(attacker.attack!, defender.defense!, defender.at!, attacker.damage!);

      this.data.calculations = {
        canCounter: attacker.attack! < defender.defense!,
        value: result
      };
    }

    return this.data;
  }

  async _updateObject(event, formData) {
    this.data = mergeObject(this.data, formData);
  }
}
