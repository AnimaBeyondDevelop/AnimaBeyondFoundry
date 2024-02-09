import { Templates } from '../../utils/constants';
import { ABFSettingsKeys } from '../../../utils/registerSettings';
import { getSelectedToken } from '../../utils/functions/getSelectedToken';

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
            hasFatiguePoints: actor.system.characteristics.secondaries.fatigue.value > 0,
        },
        token,
        actor,
        showRoll: !isGM || showRollByDefault,
        withoutRoll: actor.system.general.settings.defenseType.value === 'mass',
        roll: {
            resistance: undefined,
            value: 0,
            modifier: 0,
            fatigueUsed: 0
        }
    };
};

export class MysticActDialog extends FormApplication {
    constructor() {
        super(getInitialData());

        this.modalData = getInitialData();
        console.log(this)
        this.render(true);
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['abf-dialog mystic-act-dialog'],
            submitOnChange: true,
            closeOnSubmit: true,
            width: 525,
            height: 240,
            resizable: true,
            template: Templates.Dialog.MysticAct,
            title: game.i18n.localize('macros.dialog.mysticAct.title'),
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

        html.find('.send-roll').click(() => {
            const {
                token,
                actor,
                showRoll,
                withoutRoll,
                roll: {
                    type,
                    resistance,
                    value,
                    modifier,
                    fatigueUsed,
                    check
                },
                oppousedCheck,
                critic
            } = this.modalData;
            const { i18n } = game;


            this.render();
        });
    }

    getData() {
        const {
            roll
        } = this.modalData;
console.log("getData")

        return this.modalData;
    }

    async _updateObject(event, formData) {
        this.modalData = mergeObject(this.modalData, formData);
console.log("_updateObject")
        this.render();
    }
}

export const mysticActMacro = async () => {
    const results = new MysticActDialog();
}
