
import AttackDialog from '@svelte/components/attackDialog.svelte';
import SvelteApplicationMixin from '@svelte/SvelteApplicationMixin.svelte';

const { ApplicationV2 } = foundry.applications.api;

export class SvelteAttackDialog extends SvelteApplicationMixin(ApplicationV2) {

  get sveltePart() {
    return { component: AttackDialog, props: { sendAttack: this.sendAttack } };
  }

  constructor(sendAttack, options) {
    super(options);
    this.sendAttack = sendAttack;
  }
}
