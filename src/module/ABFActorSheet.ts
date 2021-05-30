import { openModDialog } from './utils/openDialog';
import ABFFoundryRoll from './rolls/ABFFoundryRoll';
import { ABFActor } from './ABFActor';
import { prepareSheet } from './utils/prepareSheet/prepareSheet';
import { splitAsActorAndItemChanges } from './utils/splitAsActorAndItemChanges';
import { ItemChanges } from './types/ItemChanges';
import { unflat } from '../utils/unflat';

export default class ABFActorSheet extends ActorSheet<ActorSheet.Data<ABFActor>> {
  static get defaultOptions() {
    return {
      ...super.defaultOptions,
      ...{
        classes: ['abf', 'sheet', 'actor'],
        template: 'systems/animabf/templates/actor-sheet.html',
        width: 600,
        height: 700,
        tabs: [
          {
            navSelector: '.sheet-tabs',
            contentSelector: '.sheet-body',
            initial: 'main'
          }
        ]
      }
    };
  }

  getData(): ActorSheet.Data<ABFActor> {
    const data = super.getData() as ActorSheet.Data<ABFActor>;

    if (this.actor.data.type === 'character') {
      return prepareSheet(data);
    }

    return data;
  }

  protected async _updateObject(
    event: Event,
    formData: Record<string, unknown>
  ): Promise<ABFActor> {
    const [actorChanges, itemChanges] = splitAsActorAndItemChanges(formData);

    this.updateItems(itemChanges);

    return super._updateObject(event, actorChanges);
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this));

    html.find('[data-on-click="add-secondary-skill"]').click(() => {
      this.actor.addSkillSlot();
    });

    html.find('[data-on-click="add-free-access-spell"]').click(() => {
      this.actor.addFreeAccessSpellSlot();
    });

    html.find('[data-on-click="delete-item"]').click(e => {
      const id = e.currentTarget.dataset.itemId;
      if (id) {
        this.actor.deleteOwnedItem(id);
      } else {
        console.warn(
          'Trying to delete a dynamic item but data-item-id was not set to the button. Cant delete the item.'
        );
      }
    });
  }

  async _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const { dataset } = element;

    if (dataset.roll) {
      const label = dataset.label ? `Rolling ${dataset.label}` : '';
      const mod = await openModDialog();
      const formula = `${dataset.roll}+ ${mod}`;
      const roll = new ABFFoundryRoll(formula, this.actor.data.data);
      console.log(roll);

      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label
      });
    }
  }

  private onAddFreeAccessSpellClick() {
    this.actor.addFreeAccessSpellSlot();
  }

  private onAddSkillClick() {
    this.actor.addSkillSlot();
  }

  private updateItems(itemChanges: Record<string, unknown>) {
    if (!itemChanges || Object.keys(itemChanges).length === 0) return;

    const unflattedChanges: ItemChanges = unflat(itemChanges);

    if (unflattedChanges.data.dynamic.skill) {
      this.actor.editSkills(unflattedChanges.data.dynamic.skill);
    }

    if (unflattedChanges.data.dynamic.freeAccessSpells) {
      this.actor.editFreeAccessSpells(unflattedChanges.data.dynamic.freeAccessSpells);
    }
  }
}
