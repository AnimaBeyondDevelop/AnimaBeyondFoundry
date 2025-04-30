import { ABFItems } from '../../items/ABFItems';
import { openSimpleInputDialog } from '../../utils/dialogs/openSimpleInputDialog';
import { ABFItemConfigFactory } from '../ABFItemConfig';

/** @type {import("../Items").WeaponItemConfig} */
export const WeaponItemConfig = ABFItemConfigFactory({
  type: ABFItems.WEAPON,
  isInternal: false,
  hasSheet: true,
  fieldPath: ['combat', 'weapons'],
  selectors: {
    addItemButtonSelector: 'add-weapon',
    containerSelector: '#weapons-context-menu-container',
    rowSelector: '.weapon-row'
  },
  onCreate: async actor => {
    const { i18n } = game;

    const name = await openSimpleInputDialog({
      content: i18n.localize('dialogs.items.weapons.content')
    });

    await actor.createItem({
      name,
      type: ABFItems.WEAPON
    });
  },
  onAttach: async (actor, weapon) => {
    if (
      weapon.system.isRanged &&
      typeof weapon.system.ammoId === 'string' &&
      !!weapon.system.ammoId
    ) {
      const {
        system: {
          combat: { ammo }
        }
      } = actor;

      weapon.system.ammo = ammo.find(i => i._id === weapon.system.ammoId);
    }
  }
});
