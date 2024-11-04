import { Templates } from "@module/utils/constants";
import { mount } from "svelte";
import GMCombatDialog from "@svelte/components/GMCombatDialog.svelte";
import { GMCombatManager } from '@module/combat/manager/GMCombatManager.svelte.js';

export class SvelteGMCombatDialog extends Application {
  constructor(attacker, defender, hook, bonus) {
    super()
    this.render(true)
    this.manager = new GMCombatManager(
      attacker,
      defender,
      hook,
      bonus,
      {
        onClose: () => {
          this.close()
        }
      }
    );
  }

  async _render(force = false, options = {}) {
    return super._render(force, options).then(v => {
      let element = document.getElementById("gm-combat-svelte-app");
      if (element) {
        let props = { manager: this.manager }
        mount(GMCombatDialog, { target: element, props })
      }
      return v
    })
  }


  /** @inheritdoc */
  getData() {
    return this.data
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['overflow'],
      template: Templates.Svelte.GMCombatDialog,
      width: 640,
      height: 700,
    });
  }

  async close(options) {
    if (options?.force) {
      return super.close(options);
    }

    // eslint-disable-next-line no-useless-return,consistent-return
    return;
  }
}