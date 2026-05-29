import { read, utils } from 'xlsx';
import { parseExcelToActor } from '../actor/utils/parseExcelToActor.js';

const ActorDirectoryV1 = foundry.applications?.sidebar?.tabs?.ActorDirectory ?? ActorDirectory;
export default class ABFActorDirectory extends ActorDirectoryV1 {
  /**
   * Añadir opciones personalizadas al menú contextual del actor.
   */
  _getEntryContextOptions() {
    const options = super._getEntryContextOptions();

    // Opción personalizada de importación desde Excel
    options.push({
      name: 'Import from Excel',
      icon: '<i class="fas fa-file-import"></i>',
      condition: li => {
        const { entryId } = li.dataset;
        const document = this.collection.get(entryId);
        // Verifica que el usuario tenga al menos permiso de OWNER
        return document?.testUserPermission(game.user, 'OWNER');
      },
      callback: li => {
        const { entryId } = li.dataset;
        const document = this.collection.get(entryId);
        return this.importFromExcelDialog(document);
      }
    });

    return options;
  }

  /**
   * Intercept drops over an actor row in the sidebar so dragging a system
   * "effect" Item onto an actor in the directory creates the Item on that
   * actor (Foundry V13 does not route this drop by default). Once the Item
   * exists, the global createItem hook materializes the linked ActiveEffect,
   * matching the behaviour of drops over a token on the canvas and drops
   * over an open sheet.
   *
   * @param {DragEvent} event
   */
  async _onDrop(event) {
    let data;
    try {
      const TE = foundry.applications?.ux?.TextEditor?.implementation ?? TextEditor;
      data = typeof TE?.getDragEventData === 'function'
        ? TE.getDragEventData(event)
        : JSON.parse(event.dataTransfer.getData('text/plain'));
    } catch {
      data = null;
    }

    if (data?.type === 'Item' && data.uuid) {
      const row = event.target?.closest?.('[data-entry-id], [data-document-id]');
      const actorId = row?.dataset?.entryId ?? row?.dataset?.documentId;
      const actor = actorId ? game.actors.get(actorId) : null;

      if (actor) {
        const item = await fromUuid(data.uuid);
        if (item?.type === 'effect') {
          await actor.createEmbeddedDocuments('Item', [item.toObject()]);
          return;
        }
      }
    }

    return super._onDrop?.(event);
  }

  /**
   * Muestra el diálogo para importar desde Excel
   * @param {Actor} document
   * @returns {Promise<void>}
   */
  async importFromExcelDialog(document) {
    new Dialog(
      {
        title: game.i18n.format('anima.ui.importDataFromExcelTitle', {
          name: document.name
        }),
        content: await (foundry.applications?.handlebars?.renderTemplate ?? renderTemplate)(
          'systems/animabf/templates/dialog/import-data-from-excel.html',
          {
            hint1: game.i18n.format('anima.ui.importDataFromExcelHint1', {
              documentType: document.documentName
            }),
            hint2: game.i18n.format('anima.ui.importDataFromExcelHint2', {
              name: document.name
            })
          }
        ),
        buttons: {
          import: {
            icon: '<i class="fas fa-file-import"></i>',
            label: 'Import',
            callback: html => {
              const fileInput = html.find('input[type="file"]')[0];
              const file = fileInput?.files[0];
              if (!file) {
                return ui.notifications.error('You did not upload a data file!');
              }

              this.readExcelData(file)
                .then(excelRows => parseExcelToActor(excelRows, document))
                .catch(() => {
                  ui.notifications.error('Error reading Excel file.');
                });
            }
          },
          no: {
            icon: '<i class="fas fa-times"></i>',
            label: 'Cancel'
          }
        },
        default: 'import'
      },
      { width: 400 }
    ).render(true);
  }

  /**
   * Lee y convierte los datos del archivo Excel
   * @param {File} file
   * @returns {Promise<Object>}
   */
  readExcelData(file) {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = function (e) {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = read(data, { type: 'array' });
          const worksheet = workbook.Sheets.NamedRangesList;
          if (worksheet) {
            const rows = utils.sheet_to_json(worksheet).reduce((acc, obj) => {
              acc[obj.Name] = obj.Value;
              return acc;
            }, {});
            resolve(rows);
          } else {
            reject();
          }
        } catch (err) {
          reject(err);
        }
      };

      reader.onerror = () => {
        reader.abort();
        reject();
      };

      reader.readAsArrayBuffer(file);
    });
  }
}
