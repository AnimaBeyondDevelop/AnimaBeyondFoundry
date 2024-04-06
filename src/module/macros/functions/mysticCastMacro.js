import { Templates } from '../../utils/constants';
import { getSelectedToken } from '../../utils/functions/getSelectedToken';
import { definedMagicProjectionCost } from '../../combat/utils/definedMagicProjectionCost.js';
import { ABFSettingsKeys } from '../../../utils/registerSettings';
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
            activeTab: 'mysticCast'
        },
        showRoll: !isGM || showRollByDefault,
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
            combatType: 'none',
            metamagics: {
                offensiveExpertise: 0,
                defensiveExpertise: 0,
                definedMagicProjection: 0
            }
        },
        attainableSpellGrades: [],
        zeonMaintained: actor.system.mystic.zeonMaintained.final.value,
        maintainedSpells: {},
        castedSpells: {}
    };
};

export class MysticCastDialog extends FormApplication {
    constructor() {
        super(getInitialData());

        this.modalData = getInitialData();
        this._tabs[0].callback = (event, tabs, tabName) => {
            this.modalData.ui.activeTab = tabName;
            this.render(true);
        };

        const { actor: { system: { mystic: { spells, mysticSettings, maintainedSpells } } }, selectedSpell, spellCasting, ui } = this.modalData;

        if (spells.length > 0) {
            const spell = spells.find(w => w.system.combatType.value === 'none') ?? spells[0]
            selectedSpell.id = spell._id
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

        if (maintainedSpells.length > 0) {
            for (let maintainedSpell of maintainedSpells) {
                this.modalData.maintainedSpells[maintainedSpell._id] = maintainedSpell
            }
        }

        this.modalData.castedSpells = this.modalData.actor.getFlag('animabf', 'castedSpells')

        this.render(true);
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['abf-dialog mystic-cast-dialog'],
            submitOnChange: true,
            closeOnSubmit: false,
            width: 400,
            height: 240,
            resizable: true,
            template: Templates.Dialog.MysticCast,
            title: game.i18n.localize('macros.mysticCast.dialog.title'),
            tabs: [
                {
                    navSelector: '.sheet-tabs',
                    contentSelector: '.sheet-body',
                    initial: 'mysticCast'
                }
            ]
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
                showRoll,
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

            const { name } = actor.getItem(selectedSpell.id)

            if (showRoll) {
                ChatMessage.create({
                    speaker: ChatMessage.getSpeaker({ token }),
                    flavor: i18n.format('macros.mysticCast.dialog.message.title', {
                        spell: name, grade: selectedSpell.spellGrade
                    })
                });
            }

            const spell = actor.system.mystic.spells.find(w => w._id === selectedSpell.id);
            if (spell && spell?.system?.spellType?.value === 'defense') {
                const supShieldId = await actor.newSupernaturalShield(
                    'mystic',
                    {},
                    0,
                    spell,
                    selectedSpell.spellGrade,
                    spellCasting.metamagics
                );
                actor.mysticCast(spellCasting, selectedSpell.id, selectedSpell.spellGrade, supShieldId)
            } else {
                const castedSpellId = actor.mysticCast(spellCasting, selectedSpell.id, selectedSpell.spellGrade)
                const args = {
                    thisActor: actor,
                    spellGrade: selectedSpell.spellGrade,
                    castedSpellId
                }

                executeMacro(name, args)
            }

            return this.close();

        });

        html.find('.maintain-spell-button').click(async () => {
            const {
                actor,
                maintainedSpells,
                castedSpells,
            } = this.modalData;

            for (let key in maintainedSpells) {
                let maintainedSpell = maintainedSpells[key]
                if (!maintainedSpell.system.active) {
                    await actor.deleteInnerItem(maintainedSpell.type, [maintainedSpell._id])
                    if (maintainedSpell.system.supShieldId) {
                        actor.deleteSupernaturalShield(maintainedSpell.system.supShieldId)
                    } else {
                        const args = {
                            thisActor: actor,
                            spellGrade: maintainedSpell.system.grade.value,
                            castedSpellId: maintainedSpell.system.castedSpellId,
                            release: true
                        }
                        executeMacro(maintainedSpell.name, args)
                    }
                } else {
                    maintainedSpell.id = maintainedSpell._id
                    await actor.updateInnerItem(maintainedSpell, true)
                }
            }

            for (let key in castedSpells) {
                let castedSpell = castedSpells[key];
                if (castedSpell.system.active) {
                    await actor.createInnerItem(castedSpell)
                } else {
                    if (castedSpell.system.supShieldId) {
                        actor.deleteSupernaturalShield(castedSpell.system.supShieldId)
                    } else {
                        const args = {
                            thisActor: actor,
                            spellGrade: castedSpell.system.grade.value,
                            castedSpellId: castedSpell.system.castedSpellId,
                            release: true
                        }
                        executeMacro(castedSpell.name, args)
                    }
                }
            }
            actor.unsetFlag('animabf', 'castedSpells')

            return this.close();

        });
    }


    async getData() {
        const { actor, selectedSpell, spellCasting, maintainedSpells, castedSpells } = this.modalData;
        const { spells, magicLevel: { metamagics } } = actor.system.mystic;

        if (spells.length > 0) {
            const spell = spells.find(w => w._id === selectedSpell.id);
            selectedSpell.combatType = spell.system.combatType.value;

            if (spell.system.spellType.value === 'automatic') {
                selectedSpell.metamagics.definedMagicProjection = undefined;
                selectedSpell.metamagics.offensiveExpertise = 0;
                selectedSpell.metamagics.defensiveExpertise = 0;
                selectedSpell.combatType = 'none'
            } else if (selectedSpell.metamagics.definedMagicProjection === undefined) {
                selectedSpell.metamagics.definedMagicProjection = actor.getFlag(
                    'animabf',
                    'lastDefinedMagicProjection'
                ) ?? 0
            }

            if (spellCasting.casted.prepared) {
                const preparedSpell = actor.getPreparedSpell(selectedSpell.id, selectedSpell.spellGrade);
                selectedSpell.metamagics = mergeObject(selectedSpell.metamagics, preparedSpell?.system?.metamagics)
            }
            if (selectedSpell.metamagics.definedMagicProjection > 0) {
                selectedSpell.metamagics.offensiveExpertise = 0;
                selectedSpell.metamagics.defensiveExpertise = 0;
            }

            const zeonCost = +selectedSpell.metamagics[selectedSpell.combatType === 'attack' ? 'offensiveExpertise' : 'defensiveExpertise'];
            const zeonPoolCost = definedMagicProjectionCost(selectedSpell.metamagics.definedMagicProjection);
            const addedZeonCost = { value: zeonCost, pool: zeonPoolCost }
            this.modalData.spellCasting = await actor.mysticCanCastEvaluate(selectedSpell.id, selectedSpell.spellGrade, addedZeonCost, spellCasting.casted, spellCasting.override);
        }

        this.modalData.zeonMaintained = actor.system.mystic.zeonMaintained.base.value;

        for (let key in maintainedSpells) {
            let maintainedSpell = maintainedSpells[key]
            if (maintainedSpell.system.active && !maintainedSpell.system.innate) {
                this.modalData.zeonMaintained += maintainedSpell.system.maintenanceCost.value
            }
        }

        for (let key in castedSpells) {
            let castedSpell = castedSpells[key];
            if (castedSpell.system.active && !castedSpell.system.innate) {
                this.modalData.zeonMaintained += castedSpell.system.maintenanceCost.value
            }
        }

        return this.modalData;
    }
    async _updateObject(event, formData) {
        const prevselectedSpell = this.modalData.selectedSpell.id;

        this.modalData = mergeObject(this.modalData, formData);

        if (prevselectedSpell !== this.modalData.selectedSpell.id) {

            this.modalData.selectedSpell.metamagics = {
                offensiveExpertise: 0,
                defensiveExpertise: 0,
                removeProtection: 0
            }
            const { spells } = this.modalData.actor.system.mystic;
            const spell = spells.find(w => w._id === this.modalData.selectedSpell.id);
            this.modalData.selectedSpell.spellGrade = 'base'
            this.modalData.attainableSpellGrades = []
            const intelligence = this.modalData.actor.system.characteristics.primaries.intelligence.value
            const finalIntelligence = this.modalData.actor.system.mystic.mysticSettings.aptitudeForMagicDevelopment ? intelligence + 3 : intelligence
            for (const grade in spell?.system.grades) {
                if (finalIntelligence >= spell?.system.grades[grade].intRequired.value) {
                    this.modalData.attainableSpellGrades.push(grade)
                }
            }
        }

        this.render();
    }
}

export const mysticCastMacro = async () => {
    new MysticCastDialog();
}
