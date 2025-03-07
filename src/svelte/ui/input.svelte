<script>
  /**
   * @typedef {object} Props
   */

  /** @type {Props&import('svelte/elements').HTMLInputAttributes} */
  let { value = $bindable(0), class: cssClass, ...rest } = $props();
  let size = $derived(Math.max(`${value}`.length, 1));
</script>

<input class="card-input {cssClass}" bind:value {size} {...rest} />

<style lang="scss">
  @use 'card';
  .card-input {
    width: auto;
    width: strech;
  }
</style>
