<script>
  import Group from '@svelte/ui/group.svelte';
  import Spell from '@svelte/components/spell.svelte';

  export let data;

  const i18n = game.i18n;
</script>

<Group
  cssClass="spells"
  title={i18n.localize('anima.ui.mystic.spells.title')}
  addRowButtonData="add-spell"
>
  {#snippet body()}
    {#each $data.actor.system.mystic.spells as spell}
      <div data-item-id={spell._id} class="spell-row">
        <Spell bind:spell contractible />
      </div>
    {/each}
  {/snippet}
</Group>
