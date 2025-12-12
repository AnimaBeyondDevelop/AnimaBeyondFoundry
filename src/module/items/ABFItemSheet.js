import { ABFItems } from './ABFItems';
import { ITEM_CONFIGURATIONS } from '../actor/utils/prepareItems/constants';

export default class ABFItemSheet extends ItemSheet {
  constructor(object, options) {
    super(object, options);

    this.position.width = this.getWidthFromType();
    this.position.height = this.getHeightFromType();
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['sheet', 'item'],
      resizable: true
    });
  }

  get template() {
    const configuration = ITEM_CONFIGURATIONS[this.item?.type];
    if (configuration && configuration.hasSheet) {
      return `systems/animabf/templates/items/${this.item.type}/${this.item.type}.hbs`;
    }

    return super.template;
  }

  getWidthFromType() {
    switch (this.item?.type) {
      case ABFItems.SPELL:
        return 700;
      case ABFItems.ARMOR:
        return 1000;
      case ABFItems.WEAPON:
        return 815;
      default:
        return 900;
    }
  }

  getHeightFromType() {
    switch (this.item?.type) {
      case ABFItems.SPELL:
        return 450;
      case ABFItems.WEAPON:
        return 300;
      case ABFItems.ARMOR:
        return 235;
      case ABFItems.AMMO:
        return 144;
      case ABFItems.PSYCHIC_POWER:
        return 540;
      default:
        return 450;
    }
  }

  async getData(options) {
    const sheet = await super.getData(options);

    await sheet.item.prepareDerivedData();

    sheet.system = sheet.item.system;
    sheet.config = CONFIG.config;

    return sheet;
  }

  // ABFItemSheet.js

  async _render(force, options = {}) {
    if (!this.item || !this.item.type) {
      return super._render(force, options);
    }

    if (this.item.type !== ABFItems.EFFECT) {
      return super._render(force, options);
    }

    if (
      typeof this.item.toActiveEffectData !== 'function' ||
      typeof this.item.fromActiveEffect !== 'function'
    ) {
      return super._render(force, options);
    }

    const aeData = this.item.toActiveEffectData();
    if (!aeData) return super._render(force, options);

    const parent = this.item.parent;
    const isOwned = parent instanceof Actor;

    // ============================
    // World Item (Items tab)
    // ============================
    if (!isOwned) {
      const [effect] = await this.item.createEmbeddedDocuments('ActiveEffect', [aeData]);
      if (!effect) return super._render(force, options);

      const syncHandler = async (doc, diff, hookOptions, userId) => {
        if (doc.id !== effect.id) return;
        if (userId !== game.user.id) return;

        // If user toggles "apply to actor", force it off
        if (doc.transfer === true) {
          await doc.update({ transfer: false });
          return; // avoid syncing the "true" state
        }

        await this.item.fromActiveEffect(doc);
        // IMPORTANT: do NOT delete the AE here (it would close the editor on "Add Change")
      };

      Hooks.on('updateActiveEffect', syncHandler);

      Hooks.once('closeActiveEffectConfig', async app => {
        if (app?.document?.id !== effect.id) return;

        Hooks.off('updateActiveEffect', syncHandler);
        await this.item.deleteEmbeddedDocuments('ActiveEffect', [effect.id]);
      });

      effect.sheet?.render(true);
      return;
    }

    // ============================
    // Owned Item (inside an Actor)
    // ============================
    const actor = parent;

    // Find the linked AE by origin
    let effect = actor.effects.find(e => e.origin === this.item.uuid) ?? null;

    // If missing, create it once
    if (!effect) {
      const [created] = await actor.createEmbeddedDocuments('ActiveEffect', [
        { ...aeData, origin: this.item.uuid }
      ]);
      effect = created ?? null;
    }

    if (!effect) return super._render(force, options);

    const syncHandler = async (doc, diff, hookOptions, userId) => {
      if (doc.id !== effect.id) return;
      if (userId !== game.user.id) return;

      // If user toggles "apply to actor", force it off
      if (doc.transfer === true) {
        await doc.update({ transfer: false });
        return;
      }

      await this.item.fromActiveEffect(doc);
      Hooks.off('updateActiveEffect', syncHandler);
    };

    Hooks.on('updateActiveEffect', syncHandler);
    effect.sheet?.render(true);
    return;
  }
}
