import { Templates } from "@module/utils/constants";
import { mount } from "svelte";
import AttackDialog from "@svelte/components/attackDialog.svelte";
import AttackDialogCombat from "./components/attackDialogCombat.svelte";

export class SvelteApplication extends Application {
  constructor(attacker, defender) {
    super()
    this.data = { attacker, defender }
    this.render(true)
  }

  async _render(force = false, options = {}) {
    return super._render(force, options).then(v => {
      let element = document.getElementById("svelte-app");
      if (element) {
        let props = { data: this.data }
        mount(AttackDialogCombat, { target: element, props })
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
      template: Templates.Svelte.SvelteApp,
      width: null,
      height: null,
    });
  }
}