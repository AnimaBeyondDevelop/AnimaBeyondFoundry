<!-- Inspired by https://github.com/ben/foundry-ironsworn/blob/6d8937efed9b4941ac06cb25d5996a128a47357a/src/module/vue/components/mce-editor.vue#L25 and foundry's HandlebarsHelpers.editor -->
<script>
  import Editor from '@tinymce/tinymce-svelte';
  import { createEventDispatcher } from 'svelte';

  /**
   * @typedef {Object} props Properties for the Editor component
   * @property {string} value Plain text on the editor.
   * @property {boolean} button Whether to show the edit button or not. Defaults to `true`.
   * @property {boolean} editable Whether the text is editable or not. Defaults to `true`.
   * @property {boolean} owner Include unrevealed secret tags in the final HTML? If `false`,
   * unrevealed secret blocks will be removed. Defaults to `false`.
   * @property {boolean} documents Replace dynamic document links? defaults to `true`.
   * @property {boolean} links Replace hyperlink content? defaults to `true`.
   * @property {boolean} rolls Replace inline dice rolls? Defaults to `true`.
   * @property {object | Function} The data object providing context for inline rolls,
   * or a function that produces it. Defaults to `{}`.
   * @property {boolean} async Perform the operation asynchronously returning a Promise
   * @property {() => void} onsave Callback executed when saving the editor.
   */

  /** @type {props} */
  let {
    value,
    button = true,
    editable = true,
    owner = false,
    documents = true,
    links = true,
    rolls = true,
    rollData = {},
    async = false,
    onsave
  } = $props();

  let editing = $state(false);

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
      onsave?.();
      editing = false;
    }
  };

  let enrichedHTML = $derived(
    TextEditor.enrichHTML(value, {
      secrets: owner,
      documents,
      links,
      rolls,
      rollData,
      async
    })
  );
</script>

{#if editing}
  <Editor cssClass="editor" bind:value conf={config} />
{:else}
  <div class="editor">
    {#await enrichedHTML then content}
      <div class="editor-content">{@html content}</div>
    {/await}
    {#if button && editable}
      <a class="editor-edit" onclick={() => (editing = true)}>
        <i class="fas fa-edit"></i>
      </a>
    {/if}
  </div>
{/if}
