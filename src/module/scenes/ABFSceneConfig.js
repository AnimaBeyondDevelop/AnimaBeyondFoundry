export class ABFSceneConfig extends SceneConfig {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      tabs: [
        {navSelector: ".tabs", contentSelector: "form", initial: "general"},
        {navSelector: ".tabs", contentSelector: "form", initial: "abf-config"}
      ],
    });
  }

  // Extend the getData method to include custom data
  getData(options) {
    const data = super.getData(options);
    // Add your custom data here
    data.customField = game.settings.get("custom-scene-tab", "customField");
    return data;
  }

  // Add custom tab HTML
  activateListeners(html) {
    super.activateListeners(html);
    // Add your event listeners here for custom fields
  }

  // Handle form submission for custom data
  async _updateObject(event, formData) {
    // Process custom data
    const customData = expandObject(formData).custom;
    await game.settings.set("custom-scene-tab", "customField", customData.customField);

    // Call the original method
    return super._updateObject(event, formData);
  }
}