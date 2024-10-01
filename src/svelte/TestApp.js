import { sveltify } from "@svelte/sveltify";
import { Templates } from "@module/utils/constants";
import Spell from "./components/spell.svelte";

export class TestApp extends sveltify(Application) {
  constructor(data) {
    super({ name: "Nombre" })
    this.data=data;
  }
  /** @inheritdoc */
  static get svelteDescriptors() {
    return [
      {
        componentConstructor: Spell,
        selector: '#svelte-app',
        props: {
          contractible: true,
          spell: game.actors?.get('mkVRiXQsw65FDXke')?.system.mystic.spells[0]
        }
      }
    ]
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
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