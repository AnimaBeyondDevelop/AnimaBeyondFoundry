<script>
  import Icon from './icon.svelte';

  /**
   * @typedef {Object} props
   * @property {string} [label] Text shown as tooltip in the outermost div element.
   * @property {string} [icon] Name of the icon representing the label.
   * @property {string} [iconLabel] Text shown as a tooltip in the icon or the label if `!useIcon`.
   * If undefined, `label` will be used instead.
   * @property {import('svelte/elements').MouseEventHandler<HTMLButtonElement>} [oniconClick]
   * @property {import('svelte').Snippet} [children]
   * @property {boolean} [useIcon] If set, forces the label to be an icon (when `true`) or a text
   * label (when `false`). When unset, it reads the value set in system settings.
   * @property {boolean} [dimOnDisabled] Wether to dim the label when input is disabled.
   * @property {string} [class] Css class to apply to the label container.
   */

  /** @type {props} */
  let {
    label,
    icon,
    iconLabel = label,
    oniconClick,
    children,
    useIcon,
    dimOnDisabled,
    class: cssClass
  } = $props();

  if (!icon) useIcon = false;

  if (useIcon === undefined) {
    useIcon = /** @type {boolean} */ (game.settings?.get('animabf', 'USE_ICON_LABELS'));
  }
</script>

<!--
@component
Wrapper component which adds a label to an input child. Implements logic to use icon or text labels.
It reads game.settings.get("animabf", "USE_ICON_LABELS") for a default option on whether rendering
icon or text labels, and provides a way to override this setting by specifying a boolean `useIcon`.
Allows onclick bindings for the icon with the `onIconClick` prop.
-->
<div class={['label-container', cssClass].join(' ')} title={label} class:dimOnDisabled>
  <button
    class="label"
    onclick={oniconClick}
    class:noninteractive={!oniconClick}
    title={iconLabel}
  >
    {#if useIcon && icon}
      <Icon name={icon} class="icon" />
    {:else}
      {iconLabel}
    {/if}
  </button>
  {@render children?.()}
</div>

<style lang="scss">
  @use 'card';

  .dimOnDisabled:has(:disabled) {
    opacity: 60%;
  }

  .label-container {
    height: card.$icon-size;
    display: flex;
    flex-direction: row;
    align-items: center;
    .label {
      height: 100%;

      justify-self: right;
    }
  }
</style>
