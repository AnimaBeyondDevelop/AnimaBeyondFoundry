import { ComponentProps, ComponentType, SvelteComponent } from 'svelte';
import { Subscriber, Unsubscriber, Writable } from 'svelte/store';
import { SvelteElement } from './SvelteElement';

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
  selector?: string;
};

export type DebouncedStore<T> = Writable<T> & {
  /**
   * Debounced subscription on value changes
   * @param fn - subscription callback
   * @param timeout - Timeout in miliseconds for debouncing, default 500
   */
  debounceSubscribe(fn: Subscriber<T>, timeout?: number): Unsubscriber;
}

export { sveltify } from './sveltify';
