import { sveltify } from ".";
import { Templates } from "../module/utils/constants";
import PruebaSvelte from "./components/prueba.svelte";

export class TestApp extends sveltify(FormApplication) {
  constructor() {
    super({ name: "Nombre" });
  }
  /** @inheritdoc */
  static get svelteDescriptors() {
    return [
      { componentConstructor: PruebaSvelte, selector: '#svelte-app' }
    ]
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: Templates.Svelte.SvelteApp
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
