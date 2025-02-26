<script>
  import CardTabbedCombat from '@svelte/ui/card/cardTabbedCombat.svelte';
  import { MysticDefense } from './MysticDefense.svelte';
  import MysticDefenseDialog from './mysticDefenseDialog.svelte';
  import { PhysicDefense } from './PhysicDefense.svelte';
  import PhysicDefenseDialog from './physicDefenseDialog.svelte';
  import { PsychicDefense } from './PsychicDefense.svelte';
  import PsychicDefenseDialog from './psychicDefenseDialog.svelte';

  /**
   * @import { Attack } from '../attack';
   * @import { Defense } from './Defense';
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
      label: 'attack',
      component: PhysicDefenseDialog,
      Defense: PhysicDefense,
      available: true
    },
    {
      label: 'mystic',
      component: MysticDefenseDialog,
      Defense: MysticDefense,
      available: attacker.actor.system.mystic.spells.length > 0
    },
    {
      label: 'psychic',
      component: PsychicDefenseDialog,
      Defense: PsychicDefense,
      available: attacker.actor.system.psychic.psychicPowers.length > 0
    }
  ];

  let tabs = allTabs
    .filter(tab => tab.available)
    .map(({ label, component, Attack }) => {
      return {
        label,
        component,
        props: {
          attack: new Attack(attacker, defender),
          onAttack() {
            this.attack.roll().then(() => {
              this.defense.toMessage();
              onDefense(this.defense);
            });
          }
        }
      };
    });
</script>

<CardTabbedCombat {tabs} />
