export const mutateEnrichedDescription = async system => {
  system.enrichedDescription = await TextEditor.enrichHTML(
    system.description?.value ?? '',
    { async: true }
  );
};
