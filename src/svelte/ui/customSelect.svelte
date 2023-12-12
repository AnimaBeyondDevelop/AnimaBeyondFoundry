<script>
  export let vertical = false;
  export let cls = '';
  /** @type {string | undefined} */
  export let title = undefined;
  /** @type {string | undefined} */
  export let name = undefined;
  export let disabled = false;
  export let value;
</script>

<div class="common-titled-input {cls}" class:vertical>
  {#if title}
    <p class="label">{title}</p>
  {/if}

  <select class="input" {name} {disabled} bind:value>
    <slot />
  </select>
</div>
