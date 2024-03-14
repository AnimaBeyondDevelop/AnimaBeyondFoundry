import { Templates } from '../../utils/constants';
import { ABFSettingsKeys } from '../../../utils/registerSettings';
import { getSelectedToken } from '../../utils/functions/getSelectedToken';
import { ABFDialogs } from '../../dialogs/ABFDialogs';

const getInitialData = (spareAct) => {
    const showRollByDefault = !!game.settings.get(
        'animabf',
        ABFSettingsKeys.SEND_ROLL_MESSAGES_ON_COMBAT_BY_DEFAULT
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
            zeonCost: 0
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
            ui: { activeTab, newSpell, isGM }
        } = this.modalData;
        const { i18n } = game;
        let spareAct;

        if (activeTab === 'zeon') {
            spareAct = await actor.mysticAct(usedAct)
        } else if (newSpell) {
            spareAct = await actor.mysticAct(usedAct, selectedSpell.id, selectedSpell.spellGrade)
        } else {
            spareAct = await actor.mysticAct(usedAct, undefined, undefined, preparedSpell.id)
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
        if (!isGM) {
            ChatMessage.create({
                speaker: ChatMessage.getSpeaker({ token }),
                flavor: i18n.format('macros.mysticAct.dialog.message.title', {
                    act: spareAct <= 0 ? usedAct : usedAct - spareAct
                })
            });
        }
        return this.close();
    }
    getData() {
        const { actor, zeon, act, preparedSpell, selectedSpell, ui: { newSpell, activeTab } } = this.modalData;
        const { spells, preparedSpells } = actor.system.mystic;

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
                    selectedSpell.zeonCost = spell.system.grades[selectedSpell.spellGrade ?? 'base'].zeon.value;
                    if (actor.system.mystic.act.via.length > 0) {
                        act.value = actor.system.mystic.act.via.find(v => v.name === spell?.system.via.value)?.system.final.value || actor.system.mystic.act.main.final.value
                    }

                } else if (preparedSpells.length > 0) {
                    if (!preparedSpell.id) {
                        preparedSpell.id = preparedSpells.find(ps => ps.system.prepared.value === false)?._id
                    }
                    const spell = preparedSpells.find(w => w._id === preparedSpell.id);
                    preparedSpell.zeonAcc = spell.system.zeonAcc;
                    if (actor.system.mystic.act.via.length > 0) {
                        act.value = actor.system.mystic.act.via.find(v => v.name === spell?.system.via.value)?.system.final.value || actor.system.mystic.act.main.final.value
                    }
                }
            }
        }
        const fatigueUsedBonus = act.fatigueUsed * 15
        if (act.spareAct) {
            act.final = act.spareAct
        } else {
            act.final = act.value + act.modifier + fatigueUsedBonus
        }
        act.partial = Math.floor(((act.final - fatigueUsedBonus) / 2) + fatigueUsedBonus)

        if (actor.system.mystic.zeon.value < act.final) {
            act.partial = Math.min(act.partial, actor.system.mystic.zeon.value);
            act.final = actor.system.mystic.zeon.value
        }

        return this.modalData;
    }

    async _updateObject(event, formData) {
        this.modalData = mergeObject(this.modalData, formData);

        this.render();
    }
}

export const mysticActMacro = async (spareAct) => {
    new MysticActDialog(spareAct);
}
