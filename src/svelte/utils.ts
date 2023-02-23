import { ComponentProps, SvelteComponent } from 'svelte';
import { getGame } from '../utils/helpers';

export function localize(str: string) {
  return getGame().i18n.localize(str);
}

type TConstructor<T> = new (...args: any[]) => T;

type ComponentDescriptor<T extends SvelteComponent> = {
  component: TConstructor<T>;
  name: string;
  props: ComponentProps<T>;
};

export function injectSvelte<
  // Next types are coppied from League of Foundry
  TOptions extends FormApplicationOptions = FormApplicationOptions,
  TData extends object = FormApplication.Data<{}, TOptions>,
  TConcreteObject = TData extends FormApplication.Data<infer T, TOptions> ? T : {},
  T extends SvelteComponent = SvelteComponent
>(descriptor: ComponentDescriptor<T>) {
  let { component, name, props } = descriptor;
  abstract class SvelteFormApplication extends FormApplication<TOptions, TData, TConcreteObject> {
    svelteApp: {
      component: T; // Svelte component
      element: HTMLElement; //Saving the DOM element containing the component for later use
    } | null;

    async render(force?: boolean, options?: Application.RenderOptions<TOptions>) {
      if (!options) options = {};
      await this._render(force, options); //This renders the Foundry/Handlebars part of the template
      // We need now to inject the svelte component on the corresponding container. The component is created once
      let svelteElement = this.element.find(`#svelte-${name}`).get(0);
      if (!this.svelteApp && svelteElement) {
        this.svelteApp = {
          component: new component({
            target: svelteElement,
            props
          }),
          element: svelteElement
        };
      } else if (this.svelteApp) {
        //If the component has already been created but the template is rendered again (e.g. because of data changes), the DOM changes and the element containing the component is re-created, without the injected component.
        // We replace it with the one containing the Component saved before.
        this.element.find(`#svelte-${name}`).get(0)?.replaceWith(this.svelteApp.element);
      }
    }
  }
  return SvelteFormApplication;
}
