import { ComponentProps, ComponentType, SvelteComponent } from 'svelte';

/**
 * Object describing the component associated to a `SvelteElement`
 */
export type ComponentDescriptor<T extends SvelteComponent = SvelteComponent> = {
  /**
   * The constructor of the associated SvelteComponent.
   */
  componentConstructor: ComponentType<T>;
  /**
   * Props used to initialise the SvelteComponent
   */
  props?: Partial<ComponentProps<T>>;
  /**
   * CSS selector for the host HTMLElement
   */
  selector?: string
};
