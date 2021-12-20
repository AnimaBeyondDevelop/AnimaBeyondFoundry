import { Templates } from '../utils/constants';
import ClickEvent = JQuery.ClickEvent;

type ButtonConfig = { id: string; content: string; fn?: (e?: ClickEvent) => void };

type GenericDialogData = {
  class?: string;
  content: string;
  onClose?: () => boolean | void;
  buttons: ButtonConfig[];
};

export class GenericDialog extends FormApplication<FormApplication.Options, GenericDialogData> {
  private data: GenericDialogData;

  constructor(data: GenericDialogData) {
    super(data);

    this.data = data;

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

    for (const button of this.data.buttons) {
      html.find(`#${button.id}`).click(e => {
        button.fn?.(e);
        this.close();
      });
    }
  }

  async close(): Promise<void> {
    if (!this.data.onClose?.()) {
      return super.close();
    }

    return undefined;
  }

  getData(): Promise<GenericDialogData> | GenericDialogData {
    return this.data;
  }

  async _updateObject(event, formData) {
    this.data = mergeObject(this.data, formData);

    this.render();
  }
}
