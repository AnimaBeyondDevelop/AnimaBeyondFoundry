<script>
  import CardButton from '@svelte/ui/card/cardButton.svelte';
  import IconCheckBox from '@svelte/ui/iconCheckBox.svelte';
  import CombatAttackDialog from '@svelte/components/combatAttackDialog.svelte';
  import MysticAttackDialog from '@svelte/components/mysticAttackDialog.svelte';
  import PsychicAttackDialog from '@svelte/components/psychicAttackDialog.svelte';
  import { CombatAttackManager } from '@module/combat/manager/CombatAttackManager.svelte.js';
  import { MysticAttackManager } from '@module/combat/manager/MysticAttackManager.svelte.js';
  import { PsychicAttackManager } from '@module/combat/manager/PsychicAttackManager.svelte.js';
  import { ABFSettingsKeys } from '../../utils/registerSettings';

  /**
   * @typedef {Object} Props
   * @property {string[]} tabs Localize key to obtain the label and tooltip.
   * @property {string} icon Name of the icon representing the label.
   * @property {string} [iconFolder] Path to the folder containing the icons.
   * Default value is `/systems/animabf/assets/icons/svg/`
   * @property {import('svelte/elements').MouseEventHandler<HTMLInputElement>} [oniconClick]
   * @property {import('svelte').Snippet} children
   * @property {boolean} [iconLabel] If set, forces the label to be an icon (when `true`) or a text
   * label (when `false`). When unset, it reads the value set in system settings.
   */

  /** @type {Props} */
  let { data } = $props();
  const i18n = game.i18n;
  let actorMystic = data.attacker.actor.system.mystic.spells.length !== 0;
  let actorPsychic = data.attacker.actor.system.psychic.psychicPowers.length !== 0;

  let combatManager = new CombatAttackManager(
    data.attacker,
    data.defender,
    data.hook,
    data.options
  );
  let mysticManager = actorMystic
    ? new MysticAttackManager(data.attacker, data.defender, data.hook, data.options)
    : undefined;
  let psychicManager = actorPsychic
    ? new PsychicAttackManager(data.attacker, data.defender, data.hook, data.options)
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
    <CombatAttackDialog manager={combatManager} />
  </section>
  {#if actorMystic}
    <section hidden={activeTab !== 'mystic'} class="dialog">
      <MysticAttackDialog manager={mysticManager} />
    </section>
  {/if}
  {#if actorPsychic}
    <section hidden={activeTab !== 'psychic'} class="dialog">
      <PsychicAttackDialog manager={psychicManager} />
    </section>
  {/if}
  <div class="sidebar">
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
  </div>
</div>

<style lang="scss">
  :global(:root) {
    --background-color: black;
    --main-color: rgb(184, 184, 184);
    --secondary-color: rgb(45, 45, 45);
    --light-color: white;
    --main-text-color: black;
    --secondary-text-color: white;
  }
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
