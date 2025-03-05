<script>
  import CardTabbedCombat from '@svelte/ui/card/cardTabbedCombat.svelte';
  import { PhysicAttack, MysticAttack, PsychicAttack } from '.';
  import { PhysicAttackDialog, MysticAttackDialog, PsychicAttackDialog } from '.';

  /**
   * @import { Attack } from '.';
   *
   * @typedef Props
   * @property {TokenDocument} attacker
   * @property {TokenDocument} defender
   * @property {(attack: Attack) => void} onAttack Function called when hitting
   * @property {number} [counterAttackBonus]
   * the attack button.
   */

  /** @type {Props} */
  let { attacker, defender, onAttack, counterAttackBonus } = $props();

  let allTabs = [
    {
      label: 'attack',
      component: PhysicAttackDialog,
      Attack: PhysicAttack,
      available: true
    },
    {
      label: 'mystic',
      component: MysticAttackDialog,
      Attack: MysticAttack,
      available: attacker.actor.getKnownSpells('attack').length > 0
    },
    {
      label: 'psychic',
      component: PsychicAttackDialog,
      Attack: PsychicAttack,
      available: attacker.actor.getPsychicPowers('attack').length > 0
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
            this.attack.onAttack().then(a => {
              onAttack(a);
            });
          },
          counterAttackBonus
        }
      };
    });
</script>

<CardTabbedCombat {tabs} />
