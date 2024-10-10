<script>
  export let vertical = false;
  export let cssClass = '';
  /** @type {string | undefined} */
  export let title = undefined;
  /**
   * Probably unused with Svelte. Remove it?
   * @type {string | undefined}
   */
  export let name = undefined;
  export let disabled = false;
  export let value;
  /**
   * Object describig the options for the select element. Must have the form
   * `{ value: "label"}`.
   * @type {Record<string, string> | undefined}
   */
  export let choices = undefined;
  /** If true, choices labels are localised with `game.i18n.localize()`. Defaults to `true`. */
  export let localize = true;
  /** If true, enables an option for user input. Defaults to `false`. */
  export let allowCustom = false;

  const i18n = game.i18n;

  let customInput = false;
  let inputWidth;

  /**
   * The input element for the custom input.
   * @param {HTMLInputElement} el
   */
  function inputInit(el) {
    el.value = '';
    el.focus();
  }

  /**
   * @param {Event} event
   */
  function onSelectChange(event) {
    const selectElement = event.target;
    inputWidth = selectElement?.offsetWidth;
    if (selectElement?.value === 'custom') {
      customInput = true;
    }
  }

  /**
   * @param {FocusEvent} event
   */
  function onInputBlur(event) {
    /** @type {string} */
    let inputValue = event.target.value;
    if (inputValue === '') {
      value = 'custom';
      customInput = false;
    } else {
      value = inputValue;
    }
  }

  /** @param {KeyboardEvent} event */
  function onInputKeyup(event) {
    if (['Esc', 'Escape'].includes(event.key)) {
      value = 'custom';
      customInput = false;
    }
  }
</script>

<div class="common-titled-input {cssClass}" class:vertical>
  {#if title}
    <p class="label">{title}</p>
  {/if}

  {#if customInput}
    <input
      use:inputInit
      style:width={`${inputWidth}px`}
      class="input"
      type="text"
      on:blur={onInputBlur}
      on:keyup={onInputKeyup}
    />
  {:else}
    <select class="input" {name} {disabled} bind:value on:change={onSelectChange}>
      {#if choices}
        {#each Object.entries(choices) as [choice, label]}
          <option value={choice}>{localize ? i18n.localize(label) : label}</option>
        {/each}
      {:else}
        <slot />
      {/if}
      {#if allowCustom}
        <option value="custom">{i18n.localize('dialogs.select.custom')}</option>
      {/if}
    </select>
  {/if}
</div>
