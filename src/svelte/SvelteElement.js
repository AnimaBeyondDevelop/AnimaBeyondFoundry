import { mount, unmount } from 'svelte';

/** 
 * @template {import('svelte').SvelteComponent} [T=import('svelte').SvelteComponent]
 * @classdesc Class representing an Svelte Element (that is, an Svelte component injected inside an HTMLElement)
 */
export class SvelteElement {
  // TODO: Update Types por Svelte 5
  /**
   * Holds the Svelte component object
   * @type {T | undefined}
   * @private
   */
  _component;
  /**
   * Holds the HTMLElement inside which we inject the component.
   * Used to recover the component instead of re-creating it when re-rendering the Application
   * @type {HTMLElement | undefined}
   * @private
   */
  _htmlElement;
  /**
   * The class of the Svelte component inside this `SvelteElement`
   * @type{import('svelte').ComponentType<T>}
   * @private
   */
  _componentConstructor;

  /**
   * Props used to inject the svelte component
   * @type{Partial<import('svelte').ComponentProps<T>>}
   * @private
   */
  _props;

  /**
   * Selector of the HTML element inside which this `SvelteElement` will be injected
   * @type {string}
   * @private
   */
  _selector;

  /** 
   * @param {import('.').ComponentDescriptor<T>} descriptor
   */
  constructor(descriptor) {
    const { selector, componentConstructor, props } = descriptor;
    this._componentConstructor = componentConstructor;
    this._props = props || {};
    this._selector = selector || `#svelte-${this.name}`;
  }

  /**
  * Returns wether the component is rendered
  * @returns {boolean}
  */
  get isRendered() {
    return !!this._component && this._htmlElement;
  }

  /**
   * Name of the component inside the `SvelteElement`
   * @returns {string}
   */
  get name() {
    return this._componentConstructor.name;
  }

  /**
   * CSS-like selector for the `SvelteElement`
   * @returns {string}
   */
  get selector() {
    return this._selector;
  }

  /**
  * Updates the props used to inject the component if the component hasn't been injected yet.
  * @param {import('svelte').ComponentProps<T>} props - Props object to initialise the Svelte component.
  * @returns {import('svelte').ComponentProps<T>}
  * @remark `props` merges (overriding) into the default props given in the element's constructor, if any. 
   */
  updateProps(props) {
    if (!this._component) {
      return mergeObject(
        this._props || {},
        props || {},
        {
          insertKeys: true,
          insertValues: true,
          overwrite: true,
          recursive: true
        }
      );
    }
  }

  /**
  * Initialises and renders the `SvelteElement` if it is not rendered yet, otherwise it reinjects the
  * already created `SvelteElement` into its place inside the HTML.
  * @param {HTMLElement} target The target HTML element to be substituted by the `SvelteElement`
  * @param {import('svelte').ComponentProps<T>} [props] - Props object to initialise the Svelte component.
  * @remark `props` merges (overriding) into the default props given in the element's constructor, if any. 
  */
  inject(target, props = undefined) {
    if (props) this.updateProps(props)
    // If the component has already been created but the template is rendered again (e.g. because of
    // data changes), the DOM changes and the element containing the component is re-created, without
    // the injected component. In such a case, we replace the targetElement with this.element;
    // otherwise we create it.
    if (this._component && this._htmlElement) {
      target.replaceWith(this._htmlElement);
    } else {
      this._component = mount(this._componentConstructor, { target, props: this._props });

      this._htmlElement = target;
    }
  }

  destroy() {
    unmount(this._component);
    this._htmlElement = undefined;
  }
}
