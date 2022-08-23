import { ComponentProps, SvelteComponent } from "svelte";
import { getGame } from "../utils/helpers";

export function localize(str: string) {
  return getGame().i18n.localize(str);
}

export function injectSvelte<T extends SvelteComponent>(opts: { component: T, targetID: string, props: ComponentProps<T> }) {
  return (
}
