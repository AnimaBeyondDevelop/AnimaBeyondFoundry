import { mount, unmount } from 'svelte';

/**
 * @template {import("svelte").Component} T
 * @typedef SveltePart Data necessary to define a Svelte component.
 * @property {T} component The svelte component to mount
 * @property {import("svelte").ComponentProps<T>} [props] Props to pass into the component when mounting
 */

/**
 * Augment an Application class with Svelte rendering behavior.
 *
 * How it works
 * ============
 * - Creates a foundry application on which it renders a svelte component, given by getter `sveltePart`.
 *   @see {@link SvelteApplication.sveltePart}
 *   @see {@link SvelteApplication.props()}
 * - Expects `this._prepareContext()` to return an object, which is passed to the component as an extra
 *   prop `data` if the object is non-empty.
 * - First time `.render()` is called, mounts the svelte component and injects it into the `.window-content`
 * - Following calls to `.render()` run `this.updateData()`, which by default updates `this.props.data` with
 *   the return of `this._prepareContext()`.
 * - If `this.document` is not undefined, this app is assumed to be a `DocumentSheet`, which implies:
 *   - A default `_prepareContext()` is provided, returning `{_id, name, type, img, system}` from the document,
 *     which is then passed to the component through the `data` prop.
 *   - An extra prop `document` is passed to the component as a convenience reference.
 *   - On submit, `this.document.update(this.plainData)` is called (using foundry's DocumentSheetV2 methods)
 * @template {import("svelte").Component} T
 * @template {Record<string,any>} TRenderContext
 * @param {foundry.applications.api.ApplicationV2} BaseApplication
 */
export default function SvelteApplicationMixin(BaseApplication) {
  /**
   * The mixed application class augmented with Svelte rendering behavior.
   * @extends {BaseApplication}
   */
  class SvelteApplication extends BaseApplication {
    static DEFAULT_OPTIONS = { window: { resizable: true } };

    /** @type {TRenderContext} */
    data = $state({});

    get plainData() {
      return $state.snapshot(this.data);
    }

    /** @type {Partial<import('svelte').ComponentProps<T>>&{data?: object, document?: object}} */
    #props = $state.raw({});

    /**
     * This getter returns an object with a getter/setter for evry prop in `this.#props`.
     * This, together with the `$state.raw()` in `#props` allows reactivity when updating props.
     * @type {Partial<import('svelte').ComponentProps<T>>}
     */
    get props() {
      const propGetters = {};
      for (const prop in this.#props) {
        Object.defineProperty(propGetters, prop, {
          get: () => this.#props?.[prop],
          set: value => {
            this.#props = { ...this.#props, [prop]: value };
          }
        });
      }
      return propGetters;
    }
    /**
     * This setter sets `this.#props` to a new object containing the old props and the new ones
     * for the sake of reactivity.
     * @param {Partial<import('svelte').ComponentProps<T>>} value
     */
    set props(value) {
      this.#props = { ...this.#props, ...value };
    }

    get isDocumentSheet() {
      return 'document' in this;
    }

    /**
     * Defines the top level component, together with its props for initialisation.
     * In addition to the props provided here, an extra `data` prop is passed through,
     * containing `$state(this._prepareContext())`.
     * Moreover, new props can be registered by setting `this.props = { newProp: value }`.
     * @see setter {@link props}
     * @type {SveltePart<T>}
     * @abstract
     *
     * @example
     * //Example implementation for a subclass
     * get sveltePart() {
     *  return {component: MySvelteComponent, props: {myProp: 'value'}}
     * }
     */
    get sveltePart() {
      throw Error(
        `SvelteRenderingError: ${this.constructor.name} must define 'get sveltePart()'.`
      );
    }

    /**
     * Instanciated svelte component
     * @type {ReturnType<mount<*,T>> | undefined}
     */
    #componentInstance;

    /** @type {string} Title showed in the window frame */
    // get title() {
    //   return this.document.name ?? super.title;
    // }

    /**
     * Prepare the data to be passed into the Svelte component.
     * Provides a default implementation for `DocumentSheet`, otherwise returns an empty object.
     * @param {SvelteRenderOptions} options
     * @returns {Promise<TRenderContext|{}>}
     */
    async _prepareContext(options) {
      if (this.isDocumentSheet) {
        let { _id, name, type, img, system } = this.document;
        return { _id, name, type, img, system };
      }
      return {};
    }

    /**
     * Function updating `this.data` with the return value of `this._prepareContext()`
     */
    updateData() {
      this._prepareContext({}).then(data => {
        if (foundry.utils.isEmpty(data)) return;
        for (const key in data) {
          if (data.hasOwnProperty(key)) {
            this.data[key] = data[key];
          }
        }
        this.#props.data = data;
        // PERF: This could probably be done by setting `this.props.data = data` directly, with data
        // a plain object.
      });
    }

    /**
     * Since svelte is on charge of rendering the html, this returns an empty string.
     * It updates `this.data` in order to sync the component data if its origin changes,
     * allowing update when documents are updated from foundry.
     * @param {TRenderContext} context
     * @param {SvelteRenderOptions} options
     */
    async _renderHTML(context, options) {
      this.updateData();
      return '';
    }

    /**
     * Mounts the Svelte component the first time this application is rendered.
     * @inheritdoc
     */
    _replaceHTML(result, content, options) {
      if (!options.isFirstRender) return;
      if (this.#componentInstance) return;
      if (this.isDocumentSheet) this.#props.document = this.document;
      this.#componentInstance = mount(this.sveltePart.component, {
        target: content,
        props: this.props
      });
    }

    /**
     * Extends the foundry's `_updateFrame()` method for updating the window title when
     * a document's name changes.
     * @inheritdoc
     */
    _updateFrame(options) {
      // If this app is a DocumentSheet and `name` has changed, update frame title
      if (this.isDocumentSheet && options.renderData?.name) {
        options.window ??= { title: this.title };
      }
      return super._updateFrame(options);
    }

    /**
     * @inheritdoc
     */
    _prepareSubmitData(event, form, formData) {
      return super._prepareSubmitData(event, form, this.plainData);
    }

    /**
     * No need to process form data when passing `this.plainData`
     * @inheritdoc
     */
    _processFormData(event, form, formData) {
      return formData;
    }

    /**
     * @inheritdoc
     */
    async close(options = {}) {
      // Destroy Component instance
      if (this.#componentInstance) {
        unmount(this.#componentInstance);
        this.#componentInstance = undefined;
      }
      return super.close();
    }
  }

  return SvelteApplication;
}
