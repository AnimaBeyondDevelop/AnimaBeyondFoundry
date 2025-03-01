<script>
  import CardTabbedCombat from '@svelte/ui/card/cardTabbedCombat.svelte';
  import { PhysicDefense, MysticDefense, PsychicDefense } from '.';
  import { PhysicDefenseDialog, MysticDefenseDialog, PsychicDefenseDialog } from '.';

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
  let { attacker, defender } = attack;

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
      available: defender.getKnownSpells('defense').length > 0
    },
    {
      label: 'psychic',
      component: PsychicDefenseDialog,
      Defense: PsychicDefense,
      available: defender.getPsychicPowers('defense').length > 0
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
