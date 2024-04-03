import { Templates } from '../../utils/constants';
import { getSelectedToken } from '../../utils/functions/getSelectedToken';
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
            activeTab: 'psychicCast'
        },
        showRoll: !isGM || showRollByDefault,
        token,
        actor,
        selectedPower: {
            id: undefined,
            increasePsychicPotential: 0
        },
        psychicPotential: {
            base: actor.system.psychic.psychicPotential.base.value,
            special: 0,
            final: 0
        },
        psychicPoints: actor.system.psychic.psychicPoints.value,
        innatePsychicPower: actor.system.psychic.innatePsychicPower.amount.value,
        mentalPatternImbalance: false,
        eliminateFatigue: false,
        innatePsychicPowers: {},
        castedPsychicPowers: {}
    };
};

export class PsychicCastDialog extends FormApplication {
    constructor() {
        super(getInitialData());

        this.modalData = getInitialData();
        this._tabs[0].callback = (event, tabs, tabName) => {
            this.modalData.ui.activeTab = tabName;
            this.render(true);
        };

        const { actor: { system: { psychic: { psychicPowers, innatePsychicPowers } } }, selectedPower } = this.modalData;

        if (psychicPowers.length > 0) {
            const power = psychicPowers.find(w => w.system.combatType.value === 'none')
            selectedPower.id = power ? power._id : psychicPowers[0]._id;
        }

        if (innatePsychicPowers.length > 0) {
            for (let innatePsychicPower of innatePsychicPowers) {
                this.modalData.innatePsychicPowers[innatePsychicPower._id] = innatePsychicPower
            }
        }

        this.modalData.castedPsychicPowers = this.modalData.actor.getFlag('animabf', 'castedPsychicPowers')

        this.render(true);
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['abf-dialog psychic-cast-dialog'],
            submitOnChange: true,
            closeOnSubmit: false,
            width: 400,
            height: 240,
            resizable: true,
            template: Templates.Dialog.PsychicCast,
            title: game.i18n.localize('macros.psychicCast.dialog.title'),
            tabs: [
                {
                    navSelector: '.sheet-tabs',
                    contentSelector: '.sheet-body',
                    initial: 'psychicCast'
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

        html.find('.psychic-cast-button').click(async () => {
            const {
                token,
                actor,
                selectedPower,
                psychicPotential,
                mentalPatternImbalance,
                eliminateFatigue,
                showRoll
            } = this.modalData;
            const { i18n } = game;

            const power = actor.system.psychic.psychicPowers.find(w => w._id === selectedPower.id);

            const psychicPotentialRoll = new ABFFoundryRoll(
                `1d100PsychicRoll + ${psychicPotential.final}`,
                { ...actor.system, power, mentalPatternImbalance }
            );
            psychicPotentialRoll.roll();
            if (showRoll) {
                psychicPotentialRoll.toMessage({
                    speaker: ChatMessage.getSpeaker({ token }),
                    flavor: i18n.format('macros.combat.dialog.psychicPotential.title')
                });
            }

            const psychicFatigue = await actor.evaluatePsychicFatigue(
                power,
                psychicPotentialRoll.total,
                eliminateFatigue,
                showRoll
            );

            actor.consumePsychicPoints(selectedPower.increasePsychicPotential)

            if (psychicFatigue) { return this.close() }

            if (showRoll) {
                ChatMessage.create({
                    speaker: ChatMessage.getSpeaker({ token }),
                    flavor: i18n.format('macros.psychicCast.dialog.message.title', {
                        power: power.name
                    })
                });
            }

            if (power && power?.system?.combatType?.value === 'defense') {
                const supShieldId = await actor.newSupernaturalShield(
                    'psychic',
                    power,
                    psychicPotentialRoll.total
                );
                actor.castedPsychicPower(selectedPower.id, psychicPotentialRoll.total, supShieldId)
            } else {
                const castedPsychicPowerId = actor.castedPsychicPower(selectedPower.id, psychicPotentialRoll.total)
                const args = {
                    thisActor: actor,
                    psychicPotential: psychicPotentialRoll.total,
                    castedPsychicPowerId
                }

                executeMacro(power.name, args)
            }

            return this.close();

        });

        html.find('.innate-power-button').click(async () => {
            const {
                actor,
                innatePsychicPowers,
                castedPsychicPowers
            } = this.modalData;

            for (let key in innatePsychicPowers) {
                const innatePsychicPower = innatePsychicPowers[key]
                if (!innatePsychicPower.system.active) {
                    await actor.deleteInnerItem(innatePsychicPower.type, [innatePsychicPower._id])
                    if (innatePsychicPower.system.supShieldId) {
                        actor.deleteSupernaturalShield(innatePsychicPower.system.supShieldId)
                    } else {
                        const args = {
                            thisActor: actor,
                            castedPsychicPowerId: innatePsychicPower.system.castedPsychicPowerId,
                            release: true
                        }
                        executeMacro(innatePsychicPower.name, args)
                    }
                } else {
                    innatePsychicPower.id = innatePsychicPower._id
                    await actor.updateInnerItem(innatePsychicPower, true)
                }
            }

            for (let key in castedPsychicPowers) {
                const castedPsychicPower = castedPsychicPowers[key];
                const args = {
                    thisActor: actor,
                    castedPsychicPowerId: castedPsychicPower.system.castedPsychicPowerId
                }
                if (castedPsychicPower.system.active) {
                    await actor.createInnerItem(castedPsychicPower);
                    actor.consumePsychicPoints(castedPsychicPower.system.improveInnatePower);
                    args.psychicPotential = castedPsychicPower.system.innatePsychicDifficulty
                    args.update = true
                    executeMacro(castedPsychicPower.name, args)
                } else {
                    if (castedPsychicPower.system.supShieldId) {
                        actor.deleteSupernaturalShield(castedPsychicPower.system.supShieldId)
                    } else {
                        args.release = true
                        executeMacro(castedPsychicPower.name, args)
                    }
                }
            }
            actor.unsetFlag('animabf', 'castedPsychicPowers')

            return this.close();

        });
    }


    async getData() {
        const { actor, selectedPower, psychicPotential, castedPsychicPowers } = this.modalData;
        const { psychicPowers } = actor.system.psychic;

        const power = psychicPowers.find(w => w._id === selectedPower.id);
        let psychicBonus = power?.system.bonus.value ?? 0;
        psychicPotential.final =
            psychicPotential.special +
            actor.system.psychic.psychicPotential.final.value +
            psychicBonus +
            selectedPower.increasePsychicPotential * 20;

        this.modalData.psychicPoints = actor.system.psychic.psychicPoints.value
        for (let key in castedPsychicPowers) {
            let castedPsychicPower = castedPsychicPowers[key];
            this.modalData.psychicPoints -= castedPsychicPower.system.improveInnatePower;
            const innatePsychicDifficulty = actor.innatePsychicDifficulty(castedPsychicPower.system.power, castedPsychicPower.system.improveInnatePower);
            castedPsychicPower.system.innatePsychicDifficulty = castedPsychicPower.system.psychicPotential < innatePsychicDifficulty ? castedPsychicPower.system.psychicPotential : innatePsychicDifficulty;
            castedPsychicPower.system.effect = castedPsychicPower.system.power?.system?.effects[castedPsychicPower.system.innatePsychicDifficulty]?.value ?? ''
        }
        this.modalData.psychicPoints -= selectedPower.increasePsychicPotential;

        console.log(this.modalData)
        return this.modalData;
    }
    async _updateObject(event, formData) {
        this.modalData = mergeObject(this.modalData, formData);
        this.render();
    }
}

export const psychicCastMacro = async () => {
    new PsychicCastDialog();
}
