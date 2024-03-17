import { Templates } from '../../utils/constants';
import { ABFSettingsKeys } from '../../../utils/registerSettings';
import { getSelectedToken } from '../../utils/functions/getSelectedToken';
import { definedMagicProjectionCost } from '../../combat/utils/definedMagicProjectionCost.js';
import { executeMacro } from '../../utils/functions/executeMacro';

const getInitialData = () => {
    const showRollByDefault = !!game.settings.get(
        'animabf',
        ABFSettingsKeys.SEND_ROLL_MESSAGES_ON_COMBAT_BY_DEFAULT
    );
    const isGM = !!game.user?.isGM;
    const token = getSelectedToken(game)
    const actor = token.actor;

    return {
        ui: {
            isGM,
            overrideMysticCast: false,
        },
        token,
        actor,
        spellCasting: {
            zeon: { value: 0, accumulated: 0, cost: 0, poolcost: 0 },
            canCast: { prepared: false, innate: false },
            casted: { prepared: false, innate: false },
            override: false
        },
        selectedSpell: {
            id: undefined,
            spellGrade: 'base',
            metamagics: {
            }
        },
        attainableSpellGrades: [],
    };
};

export class MysticCastDialog extends FormApplication {
    constructor() {
        super(getInitialData());

        this.modalData = getInitialData();

        const { actor: { system: { mystic: { spells, mysticSettings } } }, selectedSpell, spellCasting, ui } = this.modalData;

        if (spells.length > 0) {
            selectedSpell.id = spells[0]._id;
            const spell = spells.find(w => w._id === selectedSpell.id);
            const spellCastingOverride = this.modalData.actor.getFlag(
                'animabf',
                'spellCastingOverride'
            );
            spellCasting.override = spellCastingOverride || false;
            ui.overrideMysticCast = spellCastingOverride || false;
            if (spellCasting.override) {
                this.modalData.attainableSpellGrades = ['base', 'intermediate', 'advanced', 'arcane']
            } else {
                const intelligence = this.modalData.actor.system.characteristics.primaries.intelligence.value
                const finalIntelligence = mysticSettings.aptitudeForMagicDevelopment ? intelligence + 3 : intelligence
                for (const grade in spell?.system.grades) {
                    if (finalIntelligence >= spell?.system.grades[grade].intRequired.value) {
                        this.modalData.attainableSpellGrades.push(grade)
                    }
                }
            }
        }

        this.render(true);
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['abf-dialog mystic-cast-dialog'],
            submitOnChange: true,
            closeOnSubmit: false,
            width: 360,
            height: 240,
            resizable: true,
            template: Templates.Dialog.MysticCast,
            title: game.i18n.localize('macros.mysticCast.dialog.title')
        });
    }

    get actor() {
        return this.modalData.actor;
    }

    async close() {
        return super.close();
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find('.mystic-cast-button').click(async () => {
            const {
                token,
                actor,
                selectedSpell,
                spellCasting,
                ui
            } = this.modalData;
            const { i18n } = game;

            actor.setFlag(
                'animabf',
                'spellCastingOverride',
                spellCasting.override
            );

            if (actor.evaluateCast(spellCasting)) {
                ui.overrideMysticCast = true;
                return;
            }

            actor.mysticCast(spellCasting, selectedSpell.id, selectedSpell.spellGrade)

            if (!ui.isGM) {
                ChatMessage.create({
                    speaker: ChatMessage.getSpeaker({ token }),
                    flavor: i18n.format('macros.mysticCast.dialog.message.title', {
                        act: spareAct <= 0 ? usedAct : usedAct - spareAct
                    })
                });
            }

            const { name } = actor.getItem(selectedSpell.id)
            const args = {
                thisActor: actor,
                spellGrade: selectedSpell.spellGrade
            }

            executeMacro(name, args)

            return this.close();

        });
    }


    getData() {
        const { actor, selectedSpell, spellCasting } = this.modalData;
        const { spells, magicLevel: { metamagics } } = actor.system.mystic;

        if (spells.length > 0) {
            if (!selectedSpell.id) {
                selectedSpell.id = spells[0]._id;
            }
            if (spellCasting.casted.prepared) {
                const preparedSpell = actor.getPreparedSpell(selectedSpell.id, selectedSpell.spellGrade);
                selectedSpell.metamagics = mergeObject(selectedSpell.metamagics, preparedSpell?.system?.metamagics)
            }
            const zeonPoolCost = definedMagicProjectionCost(selectedSpell.metamagics.definedMagicProjection);
            const addedZeonCost = { value: 0, pool: zeonPoolCost }
            this.modalData.spellCasting = actor.mysticCanCastEvaluate(selectedSpell.id, selectedSpell.spellGrade, addedZeonCost, spellCasting.casted, spellCasting.override);
        }

        return this.modalData;
    }
    async _updateObject(event, formData) {
        this.modalData = mergeObject(this.modalData, formData);
        this.render();
    }
}

export const mysticCastMacro = async () => {
    new MysticCastDialog();
}
