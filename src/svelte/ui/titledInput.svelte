<script>
  export let cssClass = '';
  export let vertical = false;
  /**
   * @type {string | undefined}
   */
  export let title = undefined;
  /**
   * Input type. Default 'number'
   * @type {'number' | 'text' | 'checkbox'}
   */
  export let type = 'number';
  export let value;
  export let disabled = false;
  export let secondaryValue = undefined;
  export let secondaryEnabled = false;
</script>

<div class="{cssClass} common-titled-input" class:vertical>
  {#if title}
    <p class="label">{title}</p>
  {/if}

  <div class="input-container" class:big={secondaryValue}>
    {#if type === 'checkbox'}
      <input
        type="checkbox"
        {disabled}
        class="input"
        class:primary-input={secondaryValue}
        bind:checked={value}
      />
    {:else if type === 'text'}
      <input
        type="text"
        {disabled}
        bind:value
        class="input"
        class:primary-input={secondaryValue}
      />
      {#if secondaryValue}
        <input
          type="text"
          disabled={!secondaryEnabled}
          bind:value={secondaryValue}
          class="input secondary-input"
        />
      {/if}
    {:else if type === 'number'}
      <input
        type="number"
        {disabled}
        bind:value
        class="input"
        class:primary-input={secondaryValue}
      />
      {#if secondaryValue}
        <input
          type="number"
          disabled={!secondaryEnabled}
          bind:value={secondaryValue}
          class="input secondary-input"
        />
      {/if}
    {/if}
  </div>
</div>
