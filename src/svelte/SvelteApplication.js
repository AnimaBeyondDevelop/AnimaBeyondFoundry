import { Templates } from '../module/utils/constants';
import { debouncedStore } from './store';
import { SvelteElement } from './SvelteElement';

/**
 * For a SvelteApplication we assume that either `.getData()` returns an object with
 * a `svelteProps` field or the whole return
 * @template T Type of the data used for render the application
 */
export class SvelteApplication extends Application {

  /** @type {SvelteElement[]} */
  _svelteElements = [];

  /**
   * Svelte store containing the data returned from `.getData()`, allowing Svelte components to access it.
   * @type {import('.').DebouncedStore<T>}
   */
  dataStore;

  /**
   * @param {import('.').SvelteApplicationOptions} options
   */
  constructor(options = {}) {
    super(options)

    this.dataStore = debouncedStore(this.getData());
    if (this._updateObject) {
      this.dataStore.debounceSubscribe(v => this._updateObject({ type: 'storeUpdated' }, v));
    }

    /** @type {import('.').ComponentDescriptor[]} */
    const descriptors = this.constructor.svelteDescriptors;
    for (const descriptor of descriptors) {
      const element = new SvelteElement(descriptor);
      element.updateProps({ data: this.dataStore });
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
   * @returns {boolean}
   */
  get hasHandlebars() {
    return this.options.template.endsWith(".hbs")
  }

  /**
   * @inheritdoc
   * For a SvelteApplication, the returned object is passed to every SvelteComponent as a prop
   * called `data`.
   * @returns {T} The data used for rendering the application
   */
  getData(options) {
    return super.getData(options)
  }

  /**
   * Updates the value of `this.dataStore` using `this.getData()`.
   * @param {Partial<ApplicationOptions>} [options] options parameter passed to `.getData()`
   */
  updateStore(options = {}) {
    this.dataStore.set(this.getData(options));
  }

  /**
   * Static method returning a list of descriptors for each `SvelteComponent` in the application.
   * @abstract
   * @returns {import('.').ComponentDescriptor[]} A list of Svelte elements' descriptors.
   */
  static get svelteDescriptors() {
    throw new Error(`${this.constructor.name} must implement a static method 'svelteElements'.`);
    return []
  }

  /**
   * @inheritdoc
   */
  async _render(force, options) {
    // If the application is already rendered and doesn't have handlebars, just update the store
    if (this.element.length && !this.hasHandlebars) {
      this.updateStore();
      return
    }
    // otherwise, render the handlebars application and then inject svelteElements
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
    this.updateStore();
    return super._renderInner(data);
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
