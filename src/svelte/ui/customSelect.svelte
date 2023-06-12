<script lang="ts">
  export let vertical: boolean = false;
  export let cls: string = '';
  export let title: string | undefined = undefined;
  export let name: string | undefined = undefined;
  export let disabled: boolean = false;
  export let value: any;
</script>

<div class="common-titled-input {cls}" class:vertical>
  {#if title}
    <p class="label">{title}</p>
  {/if}

  <select class="input" {name} {disabled} bind:value>
    <slot />
  </select>
</div>
