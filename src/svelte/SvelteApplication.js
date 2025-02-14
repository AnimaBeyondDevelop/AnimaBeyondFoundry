import SvelteApplicationMixin from './SvelteApplicationMixin.svelte';

const { ApplicationV2 } = foundry.applications.api;

/**
 * Class definition for a simple Svelte Application.
 * @extends {ApplicationV2}
 * @template {import('svelte').Component} T
 */
export class SvelteApplication extends SvelteApplicationMixin(ApplicationV2) {
  static FRAMELESS_OPTIONS = {
    classes: ['animabf-frameless-app'],
    window: {
      frame: false
    }
  };

  /** @type {import('./SvelteApplicationMixin.svelte').SveltePart<T>} */
  #svelteDescriptor;

  get sveltePart() {
    return this.#svelteDescriptor;
  }

  /**
   * @param {T} Component
   * @param {import('svelte').ComponentProps<T>} props
   * @param {Partial<ApplicationOptions&{frameless?: boolean}>} options
   */
  constructor(Component, props, options) {
    if (options.frameless) {
      options = foundry.utils.mergeObject(options, {
        classes: ['animabf-frameless-app'],
        window: {
          frame: false
        }
      });
    }
    super(options);
    this.#svelteDescriptor = { component: Component, props };
  }
}
