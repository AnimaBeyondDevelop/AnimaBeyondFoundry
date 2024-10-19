<!-- Inspired by https://github.com/ben/foundry-ironsworn/blob/6d8937efed9b4941ac06cb25d5996a128a47357a/src/module/vue/components/mce-editor.vue#L25 and foundry's HandlebarsHelpers.editor -->
<script>
  import Editor from '@tinymce/tinymce-svelte';
  import { createEventDispatcher } from 'svelte';

  /**
   * @type {string}
   * Plain text on the editor.
   */
  export let value;
  /**
   */
  export let button = true;
  export let editable = true;

  /**
   * Include unrevealed secret tags in the final HTML? If false, unrevealed secret blocks
   * will be removed. Defaults to `false`.
   */
  export let owner = false;
  /** Replace dynamic document links? */
  export let documents = true;
  /** Replace hyperlink content? */
  export let links = true;
  /** Replace inline dice rolls? */
  export let rolls = true;
  /**
   * @type {object|Function}
   * The data object providing context for inline rolls, or a function that produces it.
   */
  export let rollData = {};
  /**
   * Perform the operation asynchronously returning a Promise
   */
  export let async = false;

  let editing = false;
  const dispatch = createEventDispatcher();

  const config = {
    ...CONFIG.TinyMCE,
    init_instance_callback: editor => {
      const window = editor.getWin();
      editor.focus();
      editor.selection.setCursorLocation(
        editor.getBody(),
        editor.getBody().childElementCount
      );
      window.addEventListener(
        'wheel',
        event => {
          if (event.ctrlKey) event.preventDefault();
        },
        { passive: false }
      );
      editor.off('drop dragover'); // Remove the default TinyMCE dragdrop handlers.
      editor.on('drop', event => TextEditor._onDropEditorData(event, editor));
    },
    save_enablewhendirty: false,
    save_onsavecallback: async () => {
      dispatch('save');
      editing = false;
    }
  };
  $: enrichedHTML = TextEditor.enrichHTML(value, {
    secrets: owner,
    documents,
    links,
    rolls,
    rollData,
    async
  });
</script>

{#if editing}
  <Editor cssClass="editor" bind:value conf={config} />
{:else}
  <div class="editor">
    <div class="editor-content">{@html enrichedHTML}</div>
    {#if button && editable}
      <!-- svelte-ignore a11y-missing-attribute -->
      <a class="editor-edit">
        <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
        <i class="fas fa-edit" on:click={() => (editing = true)}></i>
      </a>
    {/if}
  </div>
{/if}
