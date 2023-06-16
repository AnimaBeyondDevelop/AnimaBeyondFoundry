import { Templates } from '../utils/constants';
import ClickEvent = JQuery.ClickEvent;

type ButtonConfig = { id: string; content: string; fn?: (e?: ClickEvent) => void };

type GenericDialogData = {
  class?: string;
  content: string;
  onClose?: () => boolean | void;
  buttons: ButtonConfig[];
};

export class GenericDialog extends FormApplication<FormApplicationOptions, GenericDialogData> {
  private modalData: GenericDialogData;

  constructor(data: GenericDialogData) {
    super(data);

    this.modalData = data;

    this.render(true);
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['abf-dialog generic-dialog'],
      submitOnChange: true,
      closeOnSubmit: false,
      width: null,
      height: null,
      resizable: true,
      template: Templates.Dialog.GenericDialog,
      title: 'Dialog'
    });
  }

  activateListeners(html) {
    super.activateListeners(html);

    for (const button of this.modalData.buttons) {
      html.find(`#${button.id}`).click(e => {
        button.fn?.(e);
        this.close();
      });
    }
  }

  async close(): Promise<void> {
    if (!this.modalData.onClose?.()) {
      return super.close();
    }

    return undefined;
  }

  getData(): Promise<GenericDialogData> | GenericDialogData {
    return this.modalData;
  }

  async _updateObject(event, formData) {
    this.modalData = mergeObject(this.modalData, formData);

    this.render();
  }
}
