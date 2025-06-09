console.log("✅ ABFCanvas cargado");

import ABFCanvasLayer from './CanvasLayers/ABFCanvasLayer';

export default class ABFCanvas extends Canvas {
  static get layers() {
    console.log("✅ ABFCanvas.get layers() llamado");
    return {
      ...super.layers,
      abfCanvasLayer: ABFCanvasLayer
    };
  }

  async draw() {
    console.log("✅ ABFCanvas.draw() llamado");
    await super.draw();

    // Aquí forzamos el uso de nuestro drawLayers (por si acaso no se llama automáticamente)
    await this.drawLayers();

    return this;
  }

  async drawLayers() {
  console.log("✅ ABFCanvas.drawLayers() llamado");

  this.background = this.addLayer("background");
  this.tiles = this.addLayer("tiles");
  this.drawings = this.addLayer("drawings");

  // ✅ Instancia la capa
  const abfLayer = this.addLayer("abfCanvasLayer");
  this.abfCanvasLayer = abfLayer;

  // ✅ Si quieres que sea buscable como `canvas.layers.find(...)`
  if (!Array.isArray(this.layers)) this.layers = [];
  this.layers.push(abfLayer);

  this.tokens = this.addLayer("tokens");
  this.foreground = this.addLayer("foreground");
  this.interface = this.addLayer("interface");
}
}