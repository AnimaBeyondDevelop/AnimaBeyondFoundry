<script lang="ts">
  export let vertical: boolean = false;
  export let title: string | undefined = undefined;
  export let type: 'number' | 'text' | 'checkbox' = 'number';
  export let value: any;
  export let disabled: boolean = false;
  export let secondaryValue: any = undefined;
  export let secondaryEnabled: boolean = false;
</script>

<div class="common-titled-input" class:vertical>
  {#if title}
    <p class="label">{title}</p>
  {/if}

  <div class="input-container" class:big={secondaryValue}>
    {#if type === 'checkbox'}
      <input type="checkbox" {disabled} class="input" class:primary-input={secondaryValue} bind:checked={value} />
    {:else if type === 'text'}
      <input type="text" {disabled} bind:value class="input" class:primary-input={secondaryValue} />
      {#if secondaryValue}
        <input type="text" disabled={!secondaryEnabled} bind:value={secondaryValue} class="input secondary-input" />
      {/if}
    {:else if type === 'number'}
      <input type="number" {disabled} bind:value class="input" class:primary-input={secondaryValue} />
      {#if secondaryValue}
        <input type="number" disabled={!secondaryEnabled} bind:value={secondaryValue} class="input secondary-input" />
      {/if}
    {/if}
  </div>
</div>
