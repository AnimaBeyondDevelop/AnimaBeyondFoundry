<script>
  import CardTabbedCombat from '@svelte/ui/card/cardTabbedCombat.svelte';
  import {
    PhysicDefense,
    MysticDefense,
    PsychicDefense,
    PhysicDefenseDialog,
    MysticDefenseDialog,
    PsychicDefenseDialog
  } from '.';

  /**
   * @import { Attack } from '../attack';
   * @import { Defense } from '../defense';
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
      label: 'defense',
      component: PhysicDefenseDialog,
      Defense: PhysicDefense,
      available: true
    },
    {
      label: 'mystic',
      component: MysticDefenseDialog,
      Defense: MysticDefense,
      available: attack.defender.getKnownSpells('defense').length > 0
    },
    {
      label: 'psychic',
      component: PsychicDefenseDialog,
      Defense: PsychicDefense,
      available: attack.defender.getPsychicPowers('defense').length > 0
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
            this.defense.onDefend().then(d => {
              onDefend(d);
            });
          }
        }
      };
    });
  let activeTab =
    tabs.find(tab => tab.label === attack.defender.getLastTypeOfDefenseUsed()) ?? tabs[0];
</script>

<CardTabbedCombat {tabs} {activeTab} />
