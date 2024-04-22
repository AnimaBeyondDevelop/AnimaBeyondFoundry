import { sveltify } from "@svelte/sveltify";
import { Templates } from "@module/utils/constants";
import AttackDialog from "@svelte/components/attackDialog.svelte";

export class TestApp extends sveltify(Application) {
  constructor(data) {
    super({ name: "Nombre" })
    this.data=data;
  }
  /** @inheritdoc */
  static get svelteDescriptors() {
    return [
      {
        componentConstructor: AttackDialog,
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

  getData() {
    return this.data;
  }

  async onStoreUpdate(){
    return
  }
}