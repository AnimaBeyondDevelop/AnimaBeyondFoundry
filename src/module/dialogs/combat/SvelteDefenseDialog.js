import { Templates } from "@module/utils/constants";
import { mount } from "svelte";
import DefenseDialog from "@svelte/components/defenseDialog.svelte";

export class SvelteDefenseDialog extends Application {
  constructor(attacker, defender, hook, bonus) {
    super()
    this.data = { attacker, defender, hook, bonus }
    this.render(true)
  }

  async _render(force = false, options = {}) {
    return super._render(force, options).then(v => {
      let element = document.getElementById("defense-svelte-app");
      if (element) {
        let props = { data: this.data }
        mount(DefenseDialog, { target: element, props })
      }
      return v
    })
  }


  /** @inheritdoc */
  getData() {
    return this.data
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['overflow'],
      template: Templates.Svelte.CombatDefenseDialog,
      width: 430,
      height: 230,
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