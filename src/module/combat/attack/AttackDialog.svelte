<script>
  import CardTabbedCombat from '@svelte/ui/card/cardTabbedCombat.svelte';
  import { PhysicAttack, MysticAttack, PsychicAttack } from '.';
  import { PhysicAttackDialog, MysticAttackDialog, PsychicAttackDialog } from '.';

  /**
   * @import { Attack } from '.';
   *
   * @typedef Props
   * @property {Token} attacker
   * @property {Token} defender
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
      available: attacker.actor.system.mystic.spells.length > 0
    },
    {
      label: 'psychic',
      component: PsychicAttackDialog,
      Attack: PsychicAttack,
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
              this.attack.toMessage();
              onAttack(this.attack);
            });
          },
          counterAttackBonus
        }
      };
    });
</script>

<CardTabbedCombat {tabs} />
