import { Templates } from '../module/utils/constants';
import { debouncedStore } from './store';
import { SvelteElement } from './SvelteElement';

/**
 * @template {Application} T
 * @typedef {abstract new(...args: any[]) => T} Constructor
 **/

/**
 * @template {Application} TBase
 * @template TData Type of the data used for render the application
 * @param {abstract new(...args: any[]) => TBase} Base Constructor of the Application (sub)class to sveltify.
 */
export function sveltify(Base) {
  /**
   * @abstract
   * @inheritdoc
   */
  class SvelteApplication extends Base {

    /**
    * Array of the `SvelteElement`s in the Application
    * @type {SvelteElement[]}
    */
    _svelteElements = [];

    /**
     * Svelte store containing the data returned from `.getData()`, allowing Svelte components to access it.
     * @type {import('.').DebouncedStore<TData>}
     */
    dataStore = debouncedStore();

    /**
    * Whether the application uses handlebars or is completely Svelte-based.
    * Uses the Application's template to check if it uses handlebars,
    * thus it returns `undefined` if `this.options.template` is undefined.
    * If the extension of the Application's template is `.hbs`, `hasHandlebars` is `true`,
    * otherwise it is false.
    * @returns {boolean | undefined}
    */
    get hasHandlebars() {
      return this.options.template?.endsWith(".hbs")
    }

    /**
     * Whether the application is an ActorSheet / ItemSheet or other application.
     * @returns {boolean}
     */
    get isSheet() {
      return this.options.baseApplication?.includes("Sheet") || false;
    }

    /**
     * @param {any[]} args
     * @inheritdoc
     */
    constructor(...args) {
      super(...args)

      this.updateStore();

      if ('_updateObject' in this) {
        this.dataStore.debounceSubscribe(
          v => this['_updateObject']({ type: 'storeUpdated' }, (this.isSheet && v['data']) ? v['data'] : v)
        );
      }

      /** @type {import('.').ComponentDescriptor[]} */
      const descriptors = /** @type {typeof SvelteApplication} */(this.constructor).svelteDescriptors;
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
      return mergeObject(super['defaultOptions'], options);
    }

    /**
     * @inheritdoc
     * @param {Partial<ApplicationOptions>} [options]
     * @returns {TData | Promise<TData>} The data used for rendering the application
     */
    // @ts-ignore
    getData(options) {
      // @ts-ignore
      return super.getData(options)
    }

    /**
     * Updates the value of `this.dataStore` using `this.getData()`.
     * @param {Partial<ApplicationOptions>} [options] options parameter passed to `.getData()`
     */
    async updateStore(options = {}) {
      this.dataStore.set(await this.getData(options));
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
     * @param {boolean} [force]
     * @param {Application.RenderOptions} [options]
     */
    async _render(force, options) {
      // If the application is already rendered and doesn't have handlebars, just update the store
      if (this.element?.length && !this.hasHandlebars) {
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
     * @param {object} data Data used to render the template (the return of `.getData()`)
     */
    async _renderInner(data) {
      this.updateStore();
      return super._renderInner(data);
    }

    /**
    * @inheritdoc
    * @param {Application.CloseOptions} [options]
    */
    async close(options) {
      return super.close(options).then(_ => {
        for (const element of this._svelteElements) {
          element.destroy();
        }
      });
    }
  };

  return SvelteApplication;
};
