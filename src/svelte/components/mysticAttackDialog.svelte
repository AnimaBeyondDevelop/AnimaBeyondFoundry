<script>
  import CardSelect from '@svelte/ui/card/cardSelect.svelte';
  import CardMarkerCritic from '@svelte/ui/card/cardMarkerCritic.svelte';
  import IconCheckBox from '@svelte/ui/iconCheckBox.svelte';
  import IconSwitch from '@svelte/ui/iconSwitch.svelte';
  import ModifiedAbilityInput from '@svelte/ui/modifiedAbilityInput.svelte';
  import InputLabel from '@svelte/ui/inputLabel.svelte';
  import CombatCard from '@svelte/ui/card/combatCard.svelte';
  import CardButton from '@svelte/ui/card/cardButton.svelte';
  import IconSelect from '@svelte/ui/iconSelect.svelte';

  /**
   * @typedef {import("@module/combat/MysticAttack.svelte").MysticAttack} MysticAttack
   * @typedef props
   * @property {MysticAttack} attack
   * @property {(attack: MysticAttack) => void | Promise<void>} onAttack Function called when hitting
   * the attack button.
   */

  /** @type {props} */
  let { attack, onAttack } = $props();
  const i18n = game.i18n;

  async function onAttacka() {
    if (!attack.canCast) return;

    await attack.roll();
    attack.toMessage();
    onAttack(attack);
  }

  let distanceOptions = [
    {
      value: true,
      icon: 'point-blank',
      title: i18n.localize('macros.combat.dialog.pointBlank.title')
    },
    {
      value: false,
      icon: 'distance',
      title: i18n.localize('macros.combat.dialog.distance.title')
    }
  ];
</script>

<CombatCard>
  {#snippet buttons()}
    <div id="sidebar-button">
      <IconCheckBox
        icon="dice"
        bind:value={attack.withRoll}
        shape="circle"
        style="dark"
        title={i18n.localize(
          `macros.combat.dialog.${attack.withRoll ? 'withRoll' : 'withoutRoll'}.title`
        )}
      />
    </div>
    {#if !attack.distance && attack.isRanged}
      <div id="separator-button">
        <IconSwitch
          shape="circle"
          options={distanceOptions}
          bind:value={attack.meleeCombat}
          style="light"
        />
      </div>
    {/if}
    <div id="main-button">
      <CardButton
        shape="angled"
        onclick={() => onAttack(attack)}
        style="light"
        class="main"
      >
        {i18n.localize('macros.combat.dialog.button.attack.title')}
      </CardButton>

      <IconSwitch
        shape="circle"
        options={['accumulated', 'prepared', 'innate', 'override'].map(method => ({
          value: method,
          icon: `cast-${method}`,
          title: i18n.localize(`dialogs.castSpell.${method}.title`)
        }))}
        bind:value={attack.castMethod}
        style="light"
        class="secondary"
      />
    </div>
  {/snippet}
  {#snippet top()}
    <div class="row pull-left">
      <InputLabel
        label="macros.combat.dialog.zeonAccumulated"
        icon="zeon-accumulated"
        useIcon
      >
        <input class="card-input" value={attack.zeonAccumulated || 0} disabled />
      </InputLabel>
    </div>
    <div class="row pull-left">
      <InputLabel label="anima.ui.mystic.magicProjection.final" icon="mystic">
        <ModifiedAbilityInput bind:ability={attack.ability} />
      </InputLabel>
      <InputLabel label="macros.combat.dialog.zeonCost" icon="zeon-cost" useIcon>
        <input class="card-input" value={attack.zeonCost} disabled />
      </InputLabel>
    </div>
  {/snippet}
  {#snippet selector()}
    <CardSelect bind:value={attack.spell} options={attack.availableSpells} />
  {/snippet}
  {#snippet marker()}
    <CardMarkerCritic
      bind:damage={attack.damage}
      bind:selectedCritic={attack.critic}
      critics={{ primary: attack.spell.system.critic }}
    />
  {/snippet}
  {#snippet bottom()}
    <IconSelect
      class="spell-grade"
      bind:value={attack.spellGrade}
      height="30px"
      options={attack.availableSpellGrades.map(grade => ({
        title: i18n.localize(`macros.combat.dialog.spellGrade.${grade}.title`),
        icon: `spell-${grade}`,
        value: grade
      }))}
    />
  {/snippet}
</CombatCard>

<style lang="scss">
  @use 'card';
</style>
