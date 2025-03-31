<script>
  /**
   * @typedef Props
   * @property {string} name Name of the icon file (without extension).
   * @property {string} [folderPath] Path to the folder containing the icon file, relative assets folder.
   * Defaults to `icons/svg/`, which will find icons in `src/assets/icons/svg/`.
   * @property {string} [title] Title for the icon, displayed in the tooltip.
   * @property {string} [iconID] Id of the svg element representing the icon inside the icon file.
   * Defaults to `icon`.
   * @property {string} [fillingID] Id of the svg element representing the icon inside the icon file.
   * Defaults to `filling`.
   * @property {string} [color] Icon color. Defaults to `currentcolor`.
   * @property {string} [filling] Color for the icon filling. If unset, no filling is drawn.
   * Defaults to `transparent`.
   * @property {string} [height="100%"] Height for the icon.
   */

  /** @type {Props&import('svelte/elements').SVGAttributes<*>} */
  let {
    name,
    folderPath = 'icons/svg/',
    iconID = 'icon',
    class: cssClass = '',
    title,
    color = 'currentcolor',
    filling = 'transparent',
    height = '100%',
    ...rest
  } = $props();

  // Must refer to runtime address of assets, which in Foundry is in /systems/animabf/assets
  let iconPath = $derived(`/systems/animabf/assets/${folderPath + name}.svg`);
</script>

<!--
@component
Component displaying an svg icon from a file `{name}.svg` inside a the folder defined in `folderPath`.
Inside the file, for non-fillable icons the displayed icon must have an element/group with id `iconID`,
which is displayed. For fillable icons the filling must be in a group with id `fillingID`.

Notes:
- Extra props will be passed to the `<svg></svg>` container.
- For `color` and `filling` to work, no filling must be specified in the svg file.

Usage:
  ```tsx
  <Icon name="fatigue" width="25px" color="blue" filling="red" />
  ```
  ```tsx
  <Icon name="area_attack" width="25px" />
  ```
-->
<div class="icon" style:height {title}>
  <svg {...rest} fill={color}>
    <!-- Filling needs to be first to be behind the icon (otherwise psychic-points won't work) -->
    <use href={iconPath + '#filling'} fill={filling} />
    <use href={iconPath + '#icon'} />
  </svg>
</div>

<style>
  .icon {
    display: flex;
    place-items: center;
  }
  svg {
    height: 100%;
    width: auto;
    aspect-ratio: 1;
  }
</style>
