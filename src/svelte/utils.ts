import { ComponentProps, SvelteComponent } from 'svelte';
import { getGame } from '../utils/helpers';

export function localize(str: string) {
  return getGame().i18n.localize(str);
}

// TODO: type it in a more concrete way
type TConstructor<T> = new (...args: any[]) => T;

export type ComponentDescriptor<T extends SvelteComponent> = {
  componentConstructor: TConstructor<T>;
  props: ComponentProps<T>;
};

type Injector<T extends SvelteComponent> = { [name: string]: ComponentDescriptor<T> };

// TODO: implement a data model to allow external changes in the data to be reflcted on the component
class SvelteApp<T extends SvelteComponent> {
  component?: T;
  element?: HTMLElement;

  constructor(private descriptor: ComponentDescriptor<T>) {}

  get isRendered() {
    return !!this.component && this.element;
  }

  inject(targetElement: HTMLElement) {
    // If the component has already been created but the template is rendered again (e.g. because of data changes),
    // the DOM changes and the element containing the component is re-created, without the injected component.
    // In such a case, we replace the targetElement with this.element; otherwise we create it
    if (this.component && this.element) {
      console.log(`injecting already existent component ${this.element}`);
      targetElement.replaceWith(this.element);
    } else {
      console.log(`Creating svelte component for the first time, and injecting into ${targetElement}`);
      this.component = new this.descriptor.componentConstructor({
        target: targetElement,
        props: this.descriptor.props
      });
      this.element = targetElement;
    }
  }

  destroy() {
    this.component?.$destroy();
    this.element?.remove();
  }
}

export function injectSvelte<
  // Except for `TInjector`, all types are coppied from League of Foundry's `FormApplication`
  TOptions extends FormApplicationOptions = FormApplicationOptions,
  TData extends object = FormApplication.Data<{}, TOptions>,
  TConcreteObject = TData extends FormApplication.Data<infer T, TOptions> ? T : TData,
  TInjector extends Injector<SvelteComponent> = Injector<SvelteComponent>
>(injector: TInjector) {
  if (Object.keys(injector).length === 0) {
    throw new Error('Error injecting svelte: injector needs to be non-empty');
  }

  // TODO: improve this typing so that typescript knows which keys are on SvelteApps
  // (therefore allowing for IDE completion)
  type SvelteApps = {
    [name in keyof TInjector]: SvelteApp<InstanceType<TInjector[name]['componentConstructor']>>;
  };

  // The following iterates the keys in `injector` and constructs an object `apps` satisfying
  // apps.key = SvelteApp(injector.key.descriptor)
  const apps = Object.fromEntries(
    Object.entries(injector).map(([name, descriptor]) => [name, new SvelteApp(descriptor)])
  ) as SvelteApps;

  abstract class SvelteFormApplication extends FormApplication<TOptions, TData, TConcreteObject> {
    svelteApps: SvelteApps = apps;

    async render(force?: boolean, options?: Application.RenderOptions<TOptions>) {
      // Do not render if the application is closing or already rendering.
      const states = Application.RENDER_STATES;
      if (this._state === states.CLOSING || this._state === states.RENDERING) return;

      if (!options) options = {};
      // First, we render the Foundry/Handlebars part of the template, since we need the container of our component.
      await this._render(force, options);

      this.renderSvelteApps();
    }

    renderSvelteApps() {
      for (const app in this.svelteApps) {
        if (this.svelteApps.hasOwnProperty(app)) {
          // We first fetch the container into wich we inject the svelte component by its id.
          const targetElement = this.element.find(`#svelte-${app}`).get(0);
          if (!targetElement) {
            throw new Error(`Error rendering SvelteApp '${app}': element '#svelte-${app}' not found in the HTML.`);
          }
          this.svelteApps[app].inject(targetElement);
        }
      }
    }

    async close(options?: FormApplication.CloseOptions): Promise<void> {
      for (const app in this.svelteApps) {
        if (this.svelteApps.hasOwnProperty(app)) {
          this.svelteApps[app].destroy();
        }
      }
      return super.close(options);
    }
  }
  return SvelteFormApplication;
}
