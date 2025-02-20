import Test from './test.svelte';
import SvelteApplicationMixin from '@svelte/SvelteApplicationMixin.svelte';

const { ApplicationV2, DocumentSheetV2 } = foundry.applications.api;
const { ItemSheetV2, ActorSheetV2 } = foundry.applications.sheets;

export class TestAppV2 extends SvelteApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    classes: ['animabf-frameless-app'],
    window: {
      frame: false
    },
    form: {
      submitOnChange: true
    }
  };

  get sveltePart() {
    return { component: Test };
  }

  // async _prepareContext(options = {}) {
  //   const { name, img, system } = this.actor.toObject();
  //   return { name, img, system };
  // }

  constructor(options) {
    super();
  }
}

Hooks.once('ready', () => {
  new TestAppV2({
    document: game.actors.getName('Killiam')
  })
    .render(true)
    .then(app => (window.a = app));
});
