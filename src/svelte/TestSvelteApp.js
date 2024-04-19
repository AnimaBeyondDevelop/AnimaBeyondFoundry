import { sveltify } from "@svelte/sveltify";
import { Templates } from "@module/utils/constants";
import PruebaSvelte from "@svelte/components/spell.svelte";

export class TestApp extends sveltify(FormApplication) {
  constructor() {
    super({ name: "Nombre" });
  }
  /** @inheritdoc */
  static get svelteDescriptors() {
    return [
      {
        componentConstructor: PruebaSvelte,
        selector: '#svelte-app',
        props: {
          contractible: true,
          spell: game.items?.getName('60 - Escudo Perfecto')
        }
      }
    ]
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: Templates.Svelte.SvelteApp,
      width: 600,
      height: 600
    });
  }

  _updateObject(event, data) {
    mergeObject(this.object, data)
    console.log(this.object)
  }

  getData() {
    return this.object;
  }
}
