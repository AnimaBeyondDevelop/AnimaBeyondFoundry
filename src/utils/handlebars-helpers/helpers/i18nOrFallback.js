export const i18nOrFallbackHelper = {
  name: 'i18nOrFallback',
  fn: function (i18nKey, fallback, capitalize) {
    if (!i18nKey) return '';

    if (game.i18n.has(i18nKey)) return game.i18n.localize(i18nKey);

    let out;
    if (fallback != null && fallback !== '') {
      out = String(fallback);
    } else {
      const parts = String(i18nKey).split('.');
      out = parts.length ? parts[parts.length - 1] : String(i18nKey);
    }

    const cap = capitalize === true || capitalize === 'true';
    if (!cap || out.length === 0) return out;

    return out.charAt(0).toUpperCase() + out.slice(1);
  }
};
