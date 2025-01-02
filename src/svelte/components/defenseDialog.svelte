<script>
  // @ts-nocheck
  import CardButton from '@svelte/ui/card/cardButton.svelte';
  import IconCheckBox from '@svelte/ui/iconCheckBox.svelte';
  import CombatDefenseDialog from '@svelte/components/combatDefenseDialog.svelte';
  import ResistanceDefenseDialog from '@svelte/components/resistanceDefenseDialog.svelte';
  import MysticDefenseDialog from '@svelte/components/mysticDefenseDialog.svelte';
  import PsychicDefenseDialog from '@svelte/components/psychicDefenseDialog.svelte';
  import { CombatDefenseManager } from '@module/combat/manager/CombatDefenseManager.svelte.js';
  import { ResistanceDefenseManager } from '@module/combat/manager/ResistanceDefenseManager.svelte.js';
  import { MysticDefenseManager } from '@module/combat/manager/MysticDefenseManager.svelte.js';
  import { PsychicDefenseManager } from '@module/combat/manager/PsychicDefenseManager.svelte.js';
  import { ABFSettingsKeys } from '../../utils/registerSettings';

  let { data } = $props();
  const i18n = game.i18n;
  let actorResistance =
    data.defender.actor.system.general.settings.defenseType.value === 'resistance';
  let actorMystic = data.defender.actor.system.mystic.spells.length !== 0;
  let actorPsychic = data.defender.actor.system.psychic.psychicPowers.length !== 0;

  let combatManager = actorResistance
    ? new ResistanceDefenseManager(data.attacker, data.defender, data.hook, data.options)
    : new CombatDefenseManager(data.attacker, data.defender, data.hook, data.options);
  let mysticManager = actorMystic
    ? new MysticDefenseManager(data.attacker, data.defender, data.hook, data.options)
    : undefined;
  let psychicManager = actorPsychic
    ? new PsychicDefenseManager(data.attacker, data.defender, data.hook, data.options)
    : undefined;
  let activeTab = $state('combat');

  const showRollByDefault = !!game.settings.get(
    'animabf',
    ABFSettingsKeys.SEND_ROLL_MESSAGES_ON_COMBAT_BY_DEFAULT
  );
  const isGM = !!game.user?.isGM;

  let showRoll = $state(!isGM || showRollByDefault);
  let withRoll = $state(true);
  onShowRoll();
  onWithRoll();

  function navigationClick() {
    let tab = this.dataset.id;
    if (activeTab != tab) {
      activeTab = tab;
    }
  }

  function onShowRoll() {
    combatManager.data.showRoll = showRoll;
    if (actorMystic) {
      mysticManager.data.showRoll = showRoll;
    }
    if (actorPsychic) {
      psychicManager.data.showRoll = showRoll;
    }
  }

  function onWithRoll() {
    combatManager.data.withRoll = withRoll;
    if (actorMystic) {
      mysticManager.data.withRoll = withRoll;
    }
    if (actorPsychic) {
      psychicManager.data.withRoll = withRoll;
    }
  }
</script>

<div class="template">
  <g class="navigation">
    <CardButton
      data="combat"
      title={activeTab === 'combat' ? 'Combate' : 'C'}
      height="35px"
      edge="12px"
      width={activeTab === 'combat' ? '120px' : '50px'}
      fontSize="20px"
      onClick={navigationClick}
      secondary
    />
    {#if actorMystic}
      <CardButton
        data="mystic"
        title={activeTab === 'mystic' ? 'Místico' : 'M'}
        height="35px"
        edge="12px"
        width={activeTab === 'mystic' ? '120px' : '50px'}
        fontSize="20px"
        onClick={navigationClick}
        secondary
      />
    {/if}
    {#if actorPsychic}
      <CardButton
        data="psychic"
        title={activeTab === 'psychic' ? 'Psíquico' : 'P'}
        height="35px"
        edge="12px"
        width={activeTab === 'psychic' ? '120px' : '50px'}
        fontSize="20px"
        onClick={navigationClick}
        secondary
      />
    {/if}
  </g>
  <section hidden={activeTab !== 'combat'} class="dialog">
    {#if actorResistance}
      <ResistanceDefenseDialog manager={combatManager} />
    {:else}
      <CombatDefenseDialog manager={combatManager} />
    {/if}
  </section>
  {#if actorMystic}
    <section hidden={activeTab !== 'mystic'} class="dialog">
      <MysticDefenseDialog manager={mysticManager} />
    </section>
  {/if}
  {#if actorPsychic}
    <section hidden={activeTab !== 'psychic'} class="dialog">
      <PsychicDefenseDialog manager={psychicManager} />
    </section>
  {/if}
  <div class="sidebar">
    {#if !actorResistance || activeTab !== 'combat'}
      <IconCheckBox
        icon="dice"
        bind:value={withRoll}
        title={i18n.localize('macros.combat.dialog.rolled.title')}
        onClick={onWithRoll}
        invert={true}
        --icon-size="25px"
      />
      <IconCheckBox
        icon={showRoll ? 'eye' : 'blind'}
        bind:value={showRoll}
        title={i18n.localize('macros.combat.dialog.showRoll.title')}
        onClick={onShowRoll}
        invert={true}
        hidden={!isGM}
        --icon-size="30px"
      />
    {/if}
  </div>
</div>

<style lang="scss">
  .template {
    height: 300px;
    width: 500px;
    display: grid;
    grid-template: 2fr 2fr 2fr 2.8fr/65px 150px 150px 1fr;
    gap: 5px;

    .navigation {
      position: absolute;
      top: -40px;
      left: 45px;
      display: flex;
      gap: 10px;
    }

    .dialog {
      position: absolute;
    }

    .sidebar {
      width: 60px;
      grid-area: 1 / 1 / span 4;
      place-self: start end;
      padding: 15px;
      display: grid;
      grid-template: 30px 30px 40px 55px 40px / 1fr;
      gap: 5px;
      place-items: center;
    }
  }
</style>
