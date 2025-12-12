export default class ABFTokenHUD extends TokenHUD {
  /** @override */
  async _onRender(context, options) {
    await super._onRender(context, options);

    const root = this.element;
    if (!root) return;

    const token = this.object;
    const actor = token?.actor;
    if (!actor) return;

    const flagSystem = game.animabf.id;
    const flagKey = 'defensesCounter';

    const defensesCounter = (await actor.getFlag(flagSystem, flagKey)) ?? {
      accumulated: 0,
      keepAccumulating: true
    };

    const currentValue = Number(defensesCounter.accumulated) || 0;

    const middleCol = root.querySelector('.col.middle');
    if (!middleCol) return;

    // Reuse control if exists
    let control = middleCol.querySelector('.attribute.abf-flag-value');
    if (!control) {
      control = document.createElement('div');
      control.classList.add('attribute', 'abf-flag-value');
      control.dataset.tooltip = 'Defensas adicionales';

      control.innerHTML = `
        <label style="margin-right: 4px;">DEF</label>
        <input type="number" name="abfFlagValue" min="0" step="1" value="0">
      `;

      middleCol.prepend(control);
    }

    const input = control.querySelector("input[name='abfFlagValue']");
    if (!input) return;

    input.value = currentValue;

    input.onchange = async ev => {
      ev.stopPropagation();
      ev.preventDefault();

      const newValue = Number(ev.target.value) || 0;

      await actor.setFlag(flagSystem, flagKey, {
        ...defensesCounter,
        accumulated: newValue
      });
    };
  }
}
