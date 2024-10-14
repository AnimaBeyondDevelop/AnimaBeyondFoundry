<script>
  // @ts-nocheck
  let { data, title, onClick, fontSize, fontColor, secondaryColor } = $props();
</script>

<button
  data-id={data}
  type="button"
  style={`
  --font-size:${fontSize || '34px'};
  --font-color:${secondaryColor ? 'var(--secondary-text-color)' : 'var(--main-text-color)'};
  `}
  onclick={onClick}>{title}</button
>

<style lang="scss">
  button {
    width: auto;
    border: none;
    background: none;
    font-size: var(--font-size);
    color: var(--font-color);
    cursor: pointer;
    transition: font-size 0.2s;
    &:hover {
      box-shadow: none;
      font-size: calc(var(--font-size) - 2px);
    }
    &:focus {
      box-shadow: none;
    }
  }
</style>
