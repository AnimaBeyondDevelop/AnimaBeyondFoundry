<script>
  import Icon from './icon.svelte';

  /**
   * @import {Snippet, ComponentProps, Component} from 'svelte'
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
   * @property {Snippet<[string, ()=> void]>} [navButton] Snippet rendering a navigation button.
   * @property {Snippet<[Snippet, Snippet]>} [layout] Layout for the tabs.
   */

  /** @type {Props} */
  let { tabs, activeTab = $bindable(tabs[0]), layout, navButton } = $props();
</script>

<!--
@component
Tabs component. Implements the main logic for a tabbed component providing a default layout but
also admitting a custom one. Admits a binding for the active tab.
The tabs are specified through tab descriptors, identifying each tab with a label and providing
a component to render for the tab, together with its props.

Notes:
- A custom layout can be specified by a layout snippet, which must accept as parameters two snippets:
`navigation` for rendering the navigation bar and `content` for rendering the target component.
The layout snippet must render these two snippets. For a concrete example, see `CardTabbedCombat`.
- A custom nav button can be specified through the navButton snippet, which accepts two parameters:
the label specified in the tabs descriptor and an onclick function in charge of changing the tab.
```
-->
{#snippet navigation()}
  <ul class="navbar">
    {#each tabs as tab}
      <li class={activeTab.label === tab.label ? 'active' : ''} role="tab">
        {#if navButton}
          {@render navButton(tab.label, () => (activeTab = tab))}
        {:else}
          <Icon name={tab.label} onclick={() => (activeTab = tab)} />
        {/if}
      </li>
    {/each}
  </ul>
{/snippet}

{#snippet contents()}
  <activeTab.component {...activeTab.props} />
{/snippet}

{#if layout}
  {@render layout(navigation, contents)}
{:else}
  <div class="tabbed">
    {@render navigation()}
    <div class="content">{@render contents()}</div>
  </div>
{/if}

<style lang="scss">
  ul {
    width: fit-content;
    display: flex;
    flex-wrap: wrap;
    padding-left: 0;
    margin-bottom: 0;
    list-style: none;
    color: #1d1d1b;
  }
  li {
    cursor: pointer;
    display: flex;
    padding: 15%;
  }

  li.active {
    border-color: white;
    border-bottom: 1px;
  }
</style>
