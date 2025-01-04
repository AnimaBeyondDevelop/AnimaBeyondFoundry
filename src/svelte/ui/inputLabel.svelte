<script>
  /**
   * @typedef {Object} props
   * @property {string} label Localize key to obtain the label and tooltip.
   * @property {string} icon Name of the icon representing the label.
   * @property {string} [iconFolder] Path to the folder containing the icons.
   * Default value is `/systems/animabf/assets/icons/svg/`
   * @property {import('svelte/elements').MouseEventHandler<HTMLInputElement>} [oniconClick]
   * @property {import('svelte').Snippet} [children]
   * @property {boolean} [iconLabel] If set, forces the label to be an icon (when `true`) or a text
   * label (when `false`). When unset, it reads the value set in system settings.
   */

  /** @type {props} */
  let {
    label,
    icon = $bindable(''),
    iconFolder = $bindable('/systems/animabf/assets/icons/svg/'),
    oniconClick,
    children,
    iconLabel
  } = $props();

  if (iconLabel === undefined) {
    iconLabel = /** @type {boolean} */ (game.settings?.get('animabf', 'USE_ICON_LABELS'));
  }

  let iconPath = $derived.by(() => {
    if (!iconLabel) return undefined;
    if (!iconFolder.endsWith('/')) iconFolder += '/';
    return iconFolder + icon + '.svg';
  });
</script>

<div class="label-container">
  <input
    class={iconLabel ? 'icon' : 'label'}
    type="image"
    onclick={oniconClick}
    title={game.i18n?.localize(label + '.tooltip')}
    src={iconPath}
    alt={game.i18n?.localize(label + '.label')}
  />
  {@render children?.()}
</div>

<style lang="scss">
  .label-container {
    display: flex;
    flex-direction: row;
    padding: 6px;

    .icon {
      height: var(--icon-size, 35px);
      justify-self: right;
      transition: var(--transition, scale 0.3s ease-out, transform 0.4s ease-out);
      transform: var(--transform);
      opacity: var(--opacity);
      filter: var(--filter);
      &:hover {
        scale: var(--hover-scale, 1);
      }
    }

    input {
      color: white;
      font-size: 20px;
    }
  }
</style>
