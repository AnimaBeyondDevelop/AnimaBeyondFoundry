<script>
  import Icon from './icon.svelte';

  /**
   * @typedef {Object} props
   * @property {string} label Localize key to obtain the global tooltip.
   * @property {string} icon Name of the icon representing the label.
   * @property {string} [iconLabel] Localize key to obtain the icon's tooltip and label.
   * @property {import('svelte/elements').MouseEventHandler<HTMLButtonElement>} [oniconClick]
   * @property {import('svelte').Snippet} [children]
   * @property {boolean} [useIcon] If set, forces the label to be an icon (when `true`) or a text
   * label (when `false`). When unset, it reads the value set in system settings.
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
    class: cssClass
  } = $props();

  if (useIcon === undefined) {
    useIcon = /** @type {boolean} */ (game.settings?.get('animabf', 'USE_ICON_LABELS'));
  }
</script>

<div
  class={['label-container', cssClass].join(' ')}
  title={game.i18n?.localize(label + '.tooltip')}
>
  <button
    class="label"
    onclick={oniconClick}
    class:interactive={!!oniconClick}
    title={game.i18n?.localize(iconLabel + '.tooltip')}
  >
    {#if useIcon}
      <Icon name={icon} class="icon" />
    {:else}
      {game.i18n?.localize(iconLabel + '.label')}
    {/if}
  </button>
  {@render children?.()}
</div>

<style lang="scss">
  @use 'card';

  .label-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    .label {
      @include card.noninteractive();

      height: var(--icon-size, 35px);
      background: unset;
      border: unset;
      justify-self: right;
    }

    .interactive {
      @include card.buttonlike();
    }
  }
</style>
