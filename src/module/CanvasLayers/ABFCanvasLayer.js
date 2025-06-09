
export default class ABFCanvasLayer extends CanvasLayer {
  static get layerOptions() {
    return foundry.utils.mergeObject(super.layerOptions, {
      name: "abfCanvasLayer",
      zIndex: 180
    });
  }

  async _draw(options = {}) {
    console.log("✅ ABFCanvasLayer._draw ejecutado");

    const text = new PIXI.Text("ABF Layer activa", {
      fontSize: 36,
      fill: 0xff0000
    });
    text.position.set(100, 100);
    this.addChild(text);

    return this;
  }
}