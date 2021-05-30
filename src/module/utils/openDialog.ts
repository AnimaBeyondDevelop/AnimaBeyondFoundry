export const openDialog = <T = number>({
  title,
  name,
  placeholder = ''
}: {
  title?: string;
  name: string;
  placeholder?: string;
}): Promise<T> => {
  return new Promise(resolve => {
    new Dialog({
      title: title ?? 'Diálogo',
      content: `
      <form>
      <div class='form-group'>
        <label>${name}</label>
        <input id='dialog-input' type='text' name='dialog-input' placeholder='${placeholder}'/>
      </div>
      </form>`,
      buttons: {
        submit: {
          icon: '<i class="fas fa-check"></i>',
          label: 'Aceptar',
          callback: (html: JQuery<HTMLElement>) => {
            const results = new FormDataExtended(html.find('form')[0], {}).toObject();

            resolve(results['dialog-input'] as T);
          }
        }
      },
      default: 'submit',
      render: () => $('#dialog-input').focus()
    }).render(true);
  });
};

// Open the mod Dialog window. It returns resolver(html), which in turn returns the modifier
export const openModDialog = async () => {
  return openDialog({ name: 'Modificador', placeholder: '0' });
};
