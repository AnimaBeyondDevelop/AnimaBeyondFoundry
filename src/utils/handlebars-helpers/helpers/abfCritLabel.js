// maps weapon critic code -> i18n label via ABFConfig
export const abfCritLabel = {
  name: 'abfCritLabel',
  fn: code => {
    // Accept raw code or { value }
    const v = code && typeof code === 'object' && 'value' in code ? code.value : code;
    if (v == null) return '';

    const weaponCfg = CONFIG?.config?.iterables?.combat?.weapon ?? {};
    const key = weaponCfg.criticTypesWithNone?.[v] ?? weaponCfg.criticTypes?.[v];
    return key ? game.i18n.localize(key) : String(v);
  }
};
