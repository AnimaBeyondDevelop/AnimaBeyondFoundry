<script>
  import CardTabbedCombat from '@svelte/ui/card/cardTabbedCombat.svelte';
  import { MysticDefense } from './MysticDefense.svelte';
  import MysticDefenseDialog from './MysticDefenseDialog.svelte';
  import { PhysicDefense } from './PhysicDefense.svelte';
  import PhysicDefenseDialog from './PhysicDefenseDialog.svelte';
  import { PsychicDefense } from './PsychicDefense.svelte';
  import PsychicDefenseDialog from './PsychicDefenseDialog.svelte';

  /**
   * @import { Attack } from '../attack';
   * @import { Defense } from './Defense.svelte';
   *
   * @typedef Props
   * @property {Attack} attack
   * @property {(defense: Defense) => void} onDefend Function called when hitting
   * the defense button.
   */

  /** @type {Props} */
  let { attack, onDefend } = $props();

  let allTabs = [
    {
      label: 'attack',
      component: PhysicDefenseDialog,
      Defense: PhysicDefense,
      available: true
    },
    {
      label: 'mystic',
      component: MysticDefenseDialog,
      Defense: MysticDefense,
      available: attack.defender.actor.system.mystic.spells.length > 0
    },
    {
      label: 'psychic',
      component: PsychicDefenseDialog,
      Defense: PsychicDefense,
      available: attack.defender.actor.system.psychic.psychicPowers.length > 0
    }
  ];

  let tabs = allTabs
    .filter(tab => tab.available)
    .map(({ label, component, Defense }) => {
      return {
        label,
        component,
        props: {
          defense: new Defense(attack),
          onDefend() {
            this.defense.roll().then(() => {
              this.defense.toMessage();
              onDefend(this.defense);
            });
          }
        }
      };
    });
</script>

<CardTabbedCombat {tabs} />
