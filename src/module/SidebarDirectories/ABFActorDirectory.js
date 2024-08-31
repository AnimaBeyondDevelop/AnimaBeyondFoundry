//import { read, utils } from './../external_modules/xlsx-0.20.3/package/xlsx.mjs';
import { read, utils } from 'xlsx';
import { INITIAL_ACTOR_DATA } from '../actor/constants';
import { parseExcelToActor } from '../actor/utils/parseExcelToActor.js';

export default class ABFActorDirectory extends ActorDirectory {
  constructor(...args) {
    super(...args);
  }

  _getEntryContextOptions(){
    let result = super._getEntryContextOptions();
    let excelImportEntry = this.getExcelImportContextOption();
    result.push(excelImportEntry);
    console.log("ABFActorDirectory _getEntryContextOptions");
    console.log(result);
    return result;
  }

  getExcelImportContextOption() {
    return {
      name: 'Import from Excel',
      icon: '<i class="fas fa-file-import"></i>',
      condition: header => {
        const li = header.closest(".directory-item");
        const document = this.collection.get(li.data("documentId"));
        return document.isOwner;
      },
      callback: header => {
        const li = header.closest(".directory-item");
        const document = this.collection.get(li.data("documentId"));
        return this.importFromExcelDialog(document);
      }
    };
  }

  /**
     * Render an import dialog for updating the data related to this Document through an exported JSON file
     * @returns {Promise<void>}
     * @memberof ClientDocumentMixin#
     */
  async importFromExcelDialog(document) {
    console.log(document);
    new Dialog({
      title: `Import Data: ${this.name}`,
      content: await renderTemplate("systems/animabf/templates/dialog/import-data-from-excel.html", {
        hint1: game.i18n.format("DOCUMENT.ImportDataHint1", {document: this.documentName}),
        hint2: game.i18n.format("DOCUMENT.ImportDataHint2", {name: this.name})
      }),
      buttons: {
        import: {
          icon: '<i class="fas fa-file-import"></i>',
          label: "Import",
          callback: html => {
            const form = html.find("form")[0];
            if ( !form.data.files.length ) return ui.notifications.error("You did not upload a data file!");
            
            console.log(form.data.files[0]);

            this.readExcelData(form).then(excelRows => parseExcelToActor(excelRows, document));
            ;
          }
        },
        no: {
          icon: '<i class="fas fa-times"></i>',
          label: "Cancel"
        }
      },
      default: "import"
    }, {
      width: 400
    }).render(true);
  }

  readExcelData(form) {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
    reader.onload = function (e) {
      const data = new Uint8Array(e.target.result);
      const workbook = read(data, { type: 'array' });
      const worksheet = workbook.Sheets["FoundryData"];
      if (typeof worksheet !== "undefined") {
        const rows = utils.sheet_to_json(worksheet).reduce((acc, obj) => {
          acc[obj.ID] = obj.Value;
          return acc;
        }, {});
        resolve(rows);
      }
      else{
        reject();
      }
    };
    reader.onerror = ev => {
      reader.abort();
      reject();
    };
    reader.readAsArrayBuffer(form.data.files[0]);
  });
  }


}