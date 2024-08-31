//import { read, utils } from './../external_modules/xlsx-0.20.3/package/xlsx.mjs';
//import * as XLSX from 'xlsx';

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
      name: 'Excel Import',
      icon: '<i class="fas fa-file-import"></i>',
      condition: header => {
        const li = header.closest(".directory-item");
        const document = this.collection.get(li.data("documentId"));
        return document.isOwner;
      },
      callback: header => {
        const li = header.closest(".directory-item");
        const document = this.collection.get(li.data("documentId"));
        return this.importFromExcelDialog();
      }
    };
  }

  /**
     * Render an import dialog for updating the data related to this Document through an exported JSON file
     * @returns {Promise<void>}
     * @memberof ClientDocumentMixin#
     */
  async importFromExcelDialog() {
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

            const reader = new FileReader();
            reader.onload = function (e) {
              //var XLSX = require("xlsx");
              const data = new Uint8Array(e.target.result);
              const workbook = read(data, { type: 'array' });
              console.log(workbook);
              const sheetName = workbook.SheetNames[0];
              console.log(sheetName);
              const worksheet = workbook.Sheets[sheetName];
              console.log(worksheet);
              const json = utils.sheet_to_json(worksheet);
              console.log(json);
            };
            reader.readAsArrayBuffer(form.data.files[0]);

            //this.readSpreadsheet();
            //readTextFromFile(form.data.files[0]).then(excel => this.importFromExcel(excel));
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



// // Function to read an Excel spreadsheet using SheetJS
// readSpreadsheet(file) {
//   const reader = new FileReader();

//   reader.onload = function (e) {
//     const data = new Uint8Array(e.target.result);
//     const workbook = XLSX.read(data, { type: "array" });

//     // Assuming you want to work with the first sheet
//     const sheetName = workbook.SheetNames[0];
//     const worksheet = workbook.Sheets[sheetName];

//     // Convert the sheet to JSON
//     const jsonData = XLSX.utils.sheet_to_json(worksheet);

//     // Log the data to the console for now
//     console.log(jsonData);

//     // Optionally: Handle the imported data, e.g., creating actors/items in Foundry
//     this.handleImportedData(jsonData);
//   };

//   reader.readAsArrayBuffer(file);
// }

// // Example function to handle imported data
// handleImportedData(data) {
//   // Example: Loop through the data and create actors/items
//   data.forEach(item => {
//     console.log(`Importing: ${item.Name}`); // Adjust as per your sheet's structure

//     // Example of creating a new item in Foundry
//     const newItemData = {
//       name: item.Name, // Replace with actual column names from your Excel sheet
//       type: "weapon",  // or whatever type you are importing
//       data: {
//         damage: item.Damage,
//         range: item.Range,
//         // Add more fields as needed
//       }
//     };

//     // Create the item in the Foundry system
//     Item.create(newItemData, { temporary: false });
//   });
// }



  /**
     * Update this Document using a provided JSON string.
     * @this {ClientDocument}
     * @param {string} json                 Raw JSON data to import
     * @returns {Promise<ClientDocument>}   The updated Document instance
     */
  async importFromExcel(json) {
    if ( !CONFIG[this.documentName]?.collection ) throw new Error("Only primary Documents may be imported from JSON");

    // Construct a document class to (strictly) clean and validate the source data
    const doc = new this.constructor(JSON.parse(json), {strict: true});

    // Treat JSON import using the same workflows that are used when importing from a compendium pack
    const data = this.collection.fromCompendium(doc, {addFlags: false});

    // Preserve certain fields from the destination document
    const preserve = Object.fromEntries(this.constructor.metadata.preserveOnImport.map(k => {
      return [k, foundry.utils.getProperty(this, k)];
    }));
    preserve.folder = this.folder?.id;
    foundry.utils.mergeObject(data, preserve);

    // Commit the import as an update to this document
    await this.update(data, {diff: false, recursive: false, noHook: true});
    ui.notifications.info(game.i18n.format("DOCUMENT.Imported", {document: this.documentName, name: this.name}));
    return this;
  }
}