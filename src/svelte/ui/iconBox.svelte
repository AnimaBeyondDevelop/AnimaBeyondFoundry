<script>
  // @ts-nocheck
  let { icon, activeIcons, quantity, title, onChange, disabled } = $props();
  let iconOff = '/systems/animabf/assets/icons/svg/' + icon + '.svg';
  let iconOn = '/systems/animabf/assets/icons/svg/' + icon + '_fill.svg';

  function iconSwitch(i) {
    if (activeIcons === i + 1) {
      activeIcons = 0;
    } else activeIcons = i + 1;
    onChange?.(activeIcons);
  }
</script>

<div class="content" style="--quantity:{quantity};">
  {#each { length: quantity } as _, i}
    {#if i < activeIcons}
      <input
        class="icon"
        type="image"
        {title}
        onclick={() => iconSwitch(i)}
        src={iconOn}
        alt=""
        {disabled}
      />
    {:else}
      <input
        class="icon off"
        type="image"
        {title}
        onclick={() => iconSwitch(i)}
        src={iconOff}
        alt=""
        {disabled}
      />
    {/if}
  {/each}
</div>

<style lang="scss">
  .content {
    display: grid;
    grid-template: 1fr / repeat(var(--quantity), 1fr);
    place-items: center;
    gap: var(--gap);

    .icon {
      height: var(--icon-size, 30px);
      justify-self: right;
      transition: var(--transition, scale 0.3s ease-out, transform 0.4s ease-out);
      transform: var(--transform);
      &:hover {
        scale: 1.05;
      }
      &.off {
        opacity: 60%;
      }
    }
  }
</style>
