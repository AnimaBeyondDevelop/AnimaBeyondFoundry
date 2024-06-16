export class ABFScene extends Scene {
  constructor(...args) {
    super(...args);

    // Initialize custom fields
    this._vigilia = false;
    this._modificadorACT = 0.0;
  }

  // Define your custom fields and methods here
  get vigilia() {
    return this._vigilia;
  }

  set vigilia(value) {
    this._vigilia = value;
  }

  get modificadorACT() {
    return this._modificadorACT;
  }

  set modificadorACT(value) {
    this._modificadorACT = value;
  }
}