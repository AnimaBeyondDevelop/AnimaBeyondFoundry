import { Templates } from '../../utils/constants';
import { ABFSettingsKeys } from '../../../utils/registerSettings';
import { getSelectedToken } from '../../utils/functions/getSelectedToken';
import { roundTo5Multiples } from '../../combat/utils/roundTo5Multiples';
import { ABFDialogs } from '../../dialogs/ABFDialogs';

const getInitialData = (spareAct) => {
    const showRollByDefault = !!game.settings.get(
        'animabf',
        ABFSettingsKeys.SEND_ROLL_MESSAGES_ON_COMBAT_BY_DEFAULT
    );
    const showChatMessageByDefault = !!game.settings.get(
        'animabf',
        ABFSettingsKeys.SEND_CHAT_MESSAGES_BY_DEFAULT
    );
    const isGM = !!game.user?.isGM;
    const token = getSelectedToken(game)
    const actor = token.actor;

    const activeTab =
        actor.system.mystic.preparedSpells.find(ps => ps.system.prepared.value === false)
            ? 'preparedSpells'
            : 'zeon';
    const newSpell = !actor.system.mystic.preparedSpells.find(ps => ps.system.prepared.value === false)

    return {
        ui: {
            isGM,
            hasFatiguePoints: actor.system.characteristics.secondaries.fatigue.value > 0,
            activeTab,
            newSpell,
            noPreparingSpell: newSpell
        },
        showRoll: !isGM || showRollByDefault,
        showChatMessage: !isGM || showChatMessageByDefault,
        token,
        actor,
        zeon: {
            accumulated: actor.system.mystic.zeon.accumulated,
            value: actor.system.mystic.zeon.value
        },
        act: {
            spareAct,
            value: 0,
            final: 0,
            partial: 0,
            modifier: 0,
            fatigueUsed: 0
        },
        preparedSpell: {
            id: undefined,
            zeonAcc: { value: 0, max: 0 }
        },
        selectedSpell: {
            id: undefined,
            spellGrade: 'base',
            combatType: 'none',
            zeonCost: 0,
            metamagics: {
                offensiveExpertise: 0,
                defensiveExpertise: 0
            }
        }
    };
};

export class MysticActDialog extends FormApplication {
    constructor(spareAct) {
        super(getInitialData(spareAct));

        this.modalData = getInitialData(spareAct);
        this._tabs[0].callback = (event, tabs, tabName) => {
            this.modalData.ui.activeTab = tabName;
            this.render(true);
        };

        this._tabs[0].active = this.modalData.ui.activeTab

        const { actor: { system: { mystic: { spells } } }, selectedSpell } = this.modalData;

        if (spells.length > 0) {
            selectedSpell.id = spells[0]._id;
            const spell = spells.find(w => w._id === selectedSpell.id);
            selectedSpell.combatType = spell.system.combatType.value;
        }

        this.render(true);
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['abf-dialog mystic-act-dialog'],
            submitOnChange: true,
            closeOnSubmit: false,
            width: 360,
            height: 240,
            resizable: true,
            template: Templates.Dialog.MysticAct,
            title: game.i18n.localize('macros.mysticAct.dialog.title'),
            tabs: [
                {
                    navSelector: '.sheet-tabs',
                    contentSelector: '.sheet-body',
                    initial: 'zeon'
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

        html.find('.full-act').click(async () => {
            const { act } = this.modalData;
            await this.accumuateZeon(act.final)
        });

        html.find('.partial-act').click(async () => {
            const { act } = this.modalData;
            await this.accumuateZeon(act.partial)
        });

        html.find('.release-act').click(async () => {
            const { actor } = this.modalData;
            await actor.releaseAct(true);
            this.close();
        });

        html.find('.withstand-pain').click(async () => {
            const { actor } = this.modalData;
            await actor.zeonWithstandPain();
            this.close();
        });
    }
    async accumuateZeon(usedAct) {
        const {
            token,
            actor,
            act,
            preparedSpell,
            selectedSpell,
            showChatMessage,
            ui: { activeTab, newSpell }
        } = this.modalData;
        const { i18n } = game;
        let spareAct;

        if (activeTab === 'zeon') {
            spareAct = await actor.mysticAct(usedAct, undefined, undefined, undefined, undefined, showChatMessage)
        } else if (newSpell) {
            spareAct = await actor.mysticAct(usedAct, selectedSpell.id, selectedSpell.spellGrade, undefined, selectedSpell.metamagics, showChatMessage)
        } else {
            spareAct = await actor.mysticAct(usedAct, undefined, undefined, preparedSpell.id, undefined, showChatMessage)
        }

        if (act.fatigueUsed > 0) {
            actor.applyFatigue(act.fatigueUsed)
        }

        if (spareAct > 0) {
            await ABFDialogs.confirm(
                i18n.format('macros.mysticAct.dialog.spareActConfirm.title', {
                    spareAct
                }),
                i18n.format('macros.mysticAct.dialog.spareActConfirm.body.title'),
                {
                    onConfirm: () => {
                        mysticActMacro(spareAct)
                    }
                }
            )
        }
        return this.close();
    }
    getData() {
        const { actor, zeon, act, preparedSpell, selectedSpell, ui: { newSpell, activeTab } } = this.modalData;
        const { spells, preparedSpells, magicLevel: { metamagics } } = actor.system.mystic;

        zeon.accumulated = actor.system.mystic.zeon.accumulated;
        zeon.value = actor.system.mystic.zeon.value;

        if (activeTab === 'zeon') {
            act.value = act.spareAct || actor.system.mystic.act.main.final.value
        }
        else {
            if (spells.length > 0) {
                if (newSpell) {
                    if (!selectedSpell.id) {
                        selectedSpell.id = spells[0]._id;
                    }
                    const spell = spells.find(w => w._id === selectedSpell.id);
                    selectedSpell.combatType = spell.system.combatType.value;

                    if (spell.system.spellType.value === 'automatic') {
                        selectedSpell.metamagics.offensiveExpertise = 0;
                        selectedSpell.metamagics.defensiveExpertise = 0;
                        selectedSpell.combatType = 'none'
                    }
                    const addedZeonCost = +selectedSpell.metamagics[selectedSpell.combatType === 'attack' ? 'offensiveExpertise' : 'defensiveExpertise'];
                    selectedSpell.zeonCost = spell.system.grades[selectedSpell.spellGrade ?? 'base'].zeon.value + addedZeonCost;
                    if (actor.system.mystic.act.via.length > 0) {
                        act.value = actor.system.mystic.act.via.find(v => v.name === spell?.system.via.value)?.system.final.value || actor.system.mystic.act.main.final.value
                    }

                } else if (preparedSpells.length > 0) {
                    if (!preparedSpell.id) {
                        preparedSpell.id = preparedSpells.find(ps => ps.system.prepared.value === false)?._id
                    }
                    const spell = preparedSpells.find(w => w._id === preparedSpell.id);
                    preparedSpell.zeonAcc = spell.system.zeonAcc;
                    //agregar metamagic
                    if (actor.system.mystic.act.via.length > 0) {
                        act.value = actor.system.mystic.act.via.find(v => v.name === spell?.system.via.value)?.system.final.value || actor.system.mystic.act.main.final.value
                    }
                }
            }
        }
        const fatigueUsedBonus = act.fatigueUsed *
            (metamagics.arcanePower.exploitationOfNaturalEnergy.sphere == 2 ? 40 :
                metamagics.arcanePower.exploitationOfNaturalEnergy.sphere == 1 ? 25 : 15)
        if (act.spareAct) {
            act.final = act.spareAct
        } else {
            act.final = act.value + act.modifier + fatigueUsedBonus
        }
        act.partial = roundTo5Multiples((act.final - fatigueUsedBonus) / 2) + fatigueUsedBonus

        if (actor.system.mystic.zeon.value < act.final) {
            act.partial = Math.min(act.partial, actor.system.mystic.zeon.value);
            act.final = actor.system.mystic.zeon.value
        }

        return this.modalData;
    }

    async _updateObject(event, formData) {
        const prevselectedSpell = this.modalData.selectedSpell.id;

        this.modalData = mergeObject(this.modalData, formData);

        if (prevselectedSpell !== this.modalData.selectedSpell.id) {

            this.modalData.selectedSpell.metamagics = {
                offensiveExpertise: 0,
                defensiveExpertise: 0
            }
        }

        this.render();
    }
}

export const mysticActMacro = async (spareAct) => {
    new MysticActDialog(spareAct);
}
