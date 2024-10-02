<script>
  // @ts-nocheck
  let { selection, options, children, onChange, disabled } = $props();
  function onchange(e) {
    e.target.blur();
    onChange?.(e.target.value)
  }
</script>

<div class="select-wrapper">
  <div class="select-container">
    <select class="select-box" disabled={disabled || options.length === 0} bind:value={selection} onchange={e => onchange(e)} >
      {#each options as option}
        <option value={option.id}>{option.name}</option>
      {/each}
      {#if children}
        {@render children()}
      {/if}
    </select>
  </div>
</div>

<style lang="scss">
  .select-wrapper {
    height: 70px;
    width: 470px;
    background: black;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 37px 100%, 0 32px);
    position: relative;
    isolation: isolate;

    .select-container {
      display: grid;
      place-items: center;
      height: 60px;
      width: 460px;
      background: white;
      clip-path: polygon(0 0, 100% 0, 100% 100%, 35px 100%, 0 24px);
      position: absolute;
      top: 5px;
      left: 5px;

      .select-box {
        border: none;
        appearance: none;
        height: 60px;
        width: calc(100% - 30px);
        color: black;
        background: white;
        font-size: 30px;
        margin-left: 35px;
        padding-left: 15px;
        cursor: pointer;
        transition: font-size 0.2s;
        &:hover {
          font-size: 30.5px;
        }

        &:focus {
          font-size: 30.5px;
          outline: none;
          box-shadow: none;
        }

        &:disabled{
          font-size: 30px;
          cursor: auto;
        }

        option {
          background: white;
        }
      }
    }
  }
</style>
