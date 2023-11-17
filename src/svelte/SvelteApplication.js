import { Templates } from '../module/utils/constants';
import { SvelteElement } from './SvelteElement';

/**
 * For a SvelteApplication we assume that either `.getData()` returns an object with
 * a `svelteProps` field or the whole return
 */
export class SvelteApplication extends Application {

  /** @type {SvelteElement[]} */
  _svelteElements = [];

  /**
   * @param {import('.').SvelteApplicationOptions} options
   */
  constructor(options = {}) {
    super(options)

    /** @type {import('.').ComponentDescriptor[]} */
    const descriptors = this.constructor.svelteDescriptors();
    for (const descriptor of descriptors) {
      const element = new SvelteElement(descriptor);
      this._svelteElements.push(element);
    }
  }

  /**
   * @inheritdoc
   */
  static get defaultOptions() {
    const options = {
      classes: ['svelte-application'],
      popOut: true,
      resizable: true,
      width: 260,
      height: 160,
      template: Templates.Svelte.SvelteApp,
      id: 'svelte-application',
      title: 'Svelte Application',
    }
    return mergeObject(super.defaultOptions, options);
  }

  /**
   * @inheritdoc
   * For a SvelteApplication, the returned object is passed to every SvelteComponent as a prop
   * called `appData`.
   */
  getData(options) {
    return super.getData(options)
  }

  /**
   * Static method returning a list of descriptors for each `SvelteComponent` in the application.
   * @abstract
   * @returns {import('.').ComponentDescriptor[]}
   */
  static svelteDescriptors() {
    throw new Error(`${this.constructor.name} must implement a static method 'svelteElements'.`);
    return []
  }

  /**
   * @inheritdoc
   */
  async _render(force, options) {
    await super._render(force, options)

    for (const element of this._svelteElements) {
      const target = this.element.find(element.selector).get(0);
      if (!target) {
        throw new Error(
          `Error rendering SvelteApp: element '${element.selector}' not found in the HTML.`
        );
      }
      element.inject(target);
    }
  }

  /**
   * @inheritdoc
   */
  async _renderInner(data) {
    this._svelteElements.forEach(e => e.updateProps({ appData: data }))
    return super._renderInner(data)
  }

  /**
  * @inheritdoc
  */
  async close(options) {
    for (const element of this._svelteElements) {
      element.destroy();
    }
    return super.close(options);
  }
}
