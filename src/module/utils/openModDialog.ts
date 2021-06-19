// Open the mod Dialog window. It returns resolver(html), which in turn returns the modifier
export async function openModDialog(title = 'Dialogo') {
  return new Promise(resolve => {
    new Dialog({
      title,
      content: `
      <form>
      <div class='form-group'>
        <label>Modificador</label>
        <input id='mod' type='text' name='mod' placeholder='0'/>
      </div>
      </form>`,
      buttons: {
        submit: {
          icon: '<i class="fas fa-check"></i>',
          label: 'Aceptar',
          callback: html => {
            resolve(resolver(html));
          }
        }
      },
      default: 'submit',
      render: () => $('#mod').focus()
    }).render(true);
  });
}

const resolver = (html): string => {
  const results = new FormDataExtended(html.find('form')[0], {}).toObject();
  return results.mod as string;
};
