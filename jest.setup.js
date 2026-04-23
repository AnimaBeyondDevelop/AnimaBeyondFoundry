globalThis.game = {
  system: {
    id: 'animabf',
    title: 'Anima Beyond Fantasy',
    version: '0.0.0'
  },
  animabf: {
    id: 'animabf'
  },
  settings: {
    get: (_scope, key) => {
      if (key === 'USE_DAMAGE_TABLE') return false;
      return false;
    }
  }
};
