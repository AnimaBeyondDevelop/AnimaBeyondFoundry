<script lang="ts">
  export let vertical: boolean = false;
  export let title: string = undefined;
  export let inputValue: number;
  export let disabled: boolean = false;
  export let secondaryInputValue: number = undefined;
  export let secondaryEnabled: boolean = false;
</script>

<div class="common-titled-input" class:vertical>
  {#if title}
    <p class="label">{title}</p>
  {/if}

  <div class="input-container" class:big={secondaryInputValue}>
    <input {disabled} type="number" bind:value={inputValue} class="input" class:primary-input={secondaryInputValue} />
    {#if secondaryInputValue}
      <input
        disabled={!secondaryEnabled}
        type="number"
        bind:value={secondaryInputValue}
        class="input secondary-input"
      />
    {/if}
  </div>
</div>
