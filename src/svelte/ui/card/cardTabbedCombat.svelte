<script>
  import CardButton from '@svelte/ui/card/cardButton.svelte';
  import Tabs from '@svelte/ui/tabs.svelte';

  /**
   * @import {Component, ComponentProps} from 'svelte'
   *
   * @template {Component} [T=import('svelte').Component]
   * @typedef {Object} TabDescriptor
   * @property {string} label Displayed label for the tab
   * @property {T} component Component associated with this tab
   * @property {ComponentProps<T>} props Props used to render this tab's component.
   *
   * @typedef {Object} Props
   * @property {TabDescriptor[]} tabs List of tab descriptors. Labels must be unique.
   * @property {TabDescriptor} [activeTab] Current active tab.
   */

  /** @type {Props} */
  let { tabs, activeTab = $bindable(tabs[0]) } = $props();
</script>

<!--
@component
Component using the `Tab` component for implementing a tabbed card for combat dialogs.
Nav buttons are CardButtons located on the left vertical edge, while each tab loads a different
card basing on `CombatCard`.

Notes:
- It reads styles from `./card.scss`, but their value can overwritten by passings custom css properties
to this component:
```tsx
  <script>
    ...
    let tabs = [
      {
        label: 'attack',
        component: PhysicAttackDialog,
        props: { attack: new PhysicAttack(attacker) }
      },
      {
        label: 'mystic',
        component: OtherComponent,
        props: { ... }
      }
    ];
  </script>

  <CardTabbedCombat {tabs} --border-size=10px />
```
-->
<Tabs {tabs} bind:activeTab>
  {#snippet navButton(label, onclick)}
    <CardButton icon={label} shape="circle" {onclick} />
  {/snippet}
  {#snippet layout(navigation, content)}
    <div class="tabbed-card">
      {@render navigation()}
      {@render content()}
    </div>
  {/snippet}
</Tabs>

<style lang="scss">
  @use 'card';

  .tabbed-card {
    position: relative;
    :global {
      .navbar {
        position: absolute;
        left: calc(-0.5 * card.$navbutton-size + 0.5 * card.$border-size);
        z-index: 1;

        display: flex;
        flex-direction: column;
        gap: 5px;

        li {
          padding: 0;
          --height: #{card.$navbutton-size};
        }
        li.active {
          --background-color: #{card.$background-active};
        }
      }
    }
  }
</style>
