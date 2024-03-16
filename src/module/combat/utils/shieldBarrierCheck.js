export const shieldBarrierCheck = effect => {
  effect = effect.replace('.', '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
  console.log(effect)
  if (/barrera de dano \d+/i.test(effect)) {
    return (
      parseInt(effect.match(/barrera de dano \d+/i)[0].match(/\d+/)[0], 10) ?? 0
    );
  } else {
    return 0;
  }
};
