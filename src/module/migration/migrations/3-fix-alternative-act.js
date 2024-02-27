//import { systemDataField } from '../../../types/foundry-vtt-types/src/foundry/common/data/fields.mjs';
import { ABFItems } from '../../items/ABFItems';
/** @typedef {import('./Migration').Migration} Migration

/** @type Migration */
export const Migration3AlternativeAct = {
  version: 4,
  title: 'act alternativo',
  description: `Act alternativo`,
  async updateActor(actor) {
    // si el act alternativo no es 0, lo migramos
    if ( actor.system.mystic.act.alternative.base.value !== 0 ) {

      await actor.createInnerItem({
        name: "alternative",
        type: ABFItems.ACT_VIA,
        system: actor.system.mystic.act.alternative
      });

      await actor.createInnerItem({
        name: "alternative",
        type: ABFItems.INNATE_MAGIC_VIA,
        system: {
          base: { value: 0 },
          final: { value: 0 }
        } 
      });
    }

    // si el act alternativo es 0, no hacemos nada
    return actor;
  }
};
