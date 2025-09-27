// utils/handlebars-helpers/helpers/settingBool.js
// Returns a world boolean setting by id. Works in #if directly.
// Usage:
//   {{#if (settingBool "DEVELOP_MODE")}} ... {{/if}}
//   {{#if (settingBool "yourSystemId.DEVELOP_MODE")}} ... {{/if}}
//   {{#if (settingBool "DEVELOP_MODE" "yourSystemId")}} ... {{/if}}
export const settingBool = {
  name: 'settingBool',
  fn: (id, ns) => {
    try {
      if (!id) return false;

      let key = String(id);

      const val = game.settings.get(game.animabf.id, key);
      return !!val; // Coerce to boolean for safe use in {{#if}}
    } catch (err) {
      console.warn(`[ABF] settingBool helper error:`, err);
      return false;
    }
  }
};
