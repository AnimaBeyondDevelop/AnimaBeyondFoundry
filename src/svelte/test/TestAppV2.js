import Test from './test_psychic.svelte';
import SvelteApplicationMixin from '@svelte/SvelteApplicationMixin.svelte';

const { ApplicationV2, DocumentSheetV2 } = foundry.applications.api;
const { ItemSheetV2, ActorSheetV2 } = foundry.applications.sheets;

export class TestAppV2 extends SvelteApplicationMixin(ApplicationV2) {

  get sveltePart() {
    return {
      component: Test, props: {
        attacker: game.scenes.current.tokens.get("bXPXMKb9hgcartyV"),
        defender: game.scenes.current.tokens.get("BA25UuiiGrjIrOw1")
      }
    };
  }

  // async _prepareContext(options = {}) {
  //   const { name, img, system } = this.actor.toObject();
  //   return { name, img, system };
  // }

  constructor(options) {
    super(options);
  }
}

Hooks.once('ready', () => {
  new TestAppV2()
    .render(true)
    .then(app => (window.a = app));
});
