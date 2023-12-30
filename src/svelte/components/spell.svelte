<script>
  import Item from '@svelte/ui/item.svelte';
  import TitledInput from '@svelte/ui/titledInput.svelte';
  import CustomSelect from '@svelte/ui/customSelect.svelte';
  import Editor from '@svelte/ui/editor.svelte';
  import { ABFConfig } from '@module/ABFConfig';

  /** Whether it allows the spell's body to contract. Defaults to false. */
  export let contractible = false;

  /** @type {import('../../module/items/ABFItem').default} */
  export let spell;

  let i18n = game.i18n;

  const { iterables } = ABFConfig;
  const grades = ['base', 'intermediate', 'advanced', 'arcane'];
</script>

<Item item={spell} cssClass="spell-svelte" {contractible}>
  <div class="spell-header" slot="header">
    <div class="first-row">
      <TitledInput cssClass="name" type="text" bind:value={spell.name} />
    </div>
    <div class="second-row">
      <TitledInput
        cssClass="level"
        title={i18n.localize('anima.ui.mystic.spell.level.title')}
        bind:value={spell.system.level.value}
      />
      <CustomSelect
        cssClass="via"
        title={i18n.localize('anima.ui.mystic.spell.via.title')}
        bind:value={spell.system.via.value}
        choices={iterables.mystic.vias}
        allowCustom
      />
    </div>
  </div>
  <div slot="body">
    {#each grades as grade}
      <div class="{grade}-grade grade-row">
        <p class="label grade-name">
          {i18n.localize(`anima.ui.mystic.spell.grade.${grade}.title`)}
        </p>
        <TitledInput
          cssClass="int-required"
          vertical={true}
          title={grade === 'base'
            ? i18n.localize('anima.ui.mystic.spell.grade.intRequired.title')
            : undefined}
          bind:value={spell.system.grades[grade].intRequired.value}
        />
        <TitledInput
          cssClass="zeon"
          vertical={true}
          title={grade === 'base'
            ? i18n.localize('anima.ui.mystic.spell.grade.zeon.title')
            : undefined}
          bind:value={spell.system.grades[grade].zeon.value}
        />
        <TitledInput
          cssClass="maintenance-cost"
          vertical={true}
          title={grade === 'base'
            ? i18n.localize('anima.ui.mystic.spell.grade.maintenanceCost.title')
            : undefined}
          bind:value={spell.system.grades[grade].maintenanceCost.value}
        />
        <TitledInput
          cssClass="grade-description"
          vertical={true}
          title={grade === 'base'
            ? i18n.localize('anima.ui.mystic.spell.grade.description.title')
            : undefined}
          type="text"
          bind:value={spell.system.grades[grade].description.value}
        />
      </div>
    {/each}
    <div class="description">
      <p class="label">
        {i18n.localize('anima.ui.mystic.spell.grade.description.title')}
      </p>
      <Editor bind:value={spell.system.description} owner={true} />
    </div>
  </div>
  <div class="spell-footer" slot="footer">
    <CustomSelect
      cssClass="spell-type"
      title={i18n.localize('anima.ui.mystic.spell.spellType.title')}
      bind:value={spell.system.spellType.value}
      choices={iterables.mystic.spellTypes}
    />
    <CustomSelect
      cssClass="action-type"
      title={i18n.localize('anima.ui.mystic.spell.actionType.title')}
      bind:value={spell.system.actionType.value}
      choices={iterables.mystic.actionTypes}
    />
    <TitledInput
      cssClass="has-daily-maintenance"
      title={i18n.localize('anima.ui.mystic.spell.hasDailyMaintenance.title')}
      type="checkbox"
      bind:value={spell.system.hasDailyMaintenance.value}
    />
  </div>
</Item>
