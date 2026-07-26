/**
 * Ritual time bonuses for entity power invocation (Anima Table 65).
 * @readonly
 */
export const ENTITY_POWER_RITUAL_TIMES = {
  immediate: { modifier: -100, label: 'anima.ui.mystic.entityPower.ritualTime.immediate.title' },
  fullRound: { modifier: -50, label: 'anima.ui.mystic.entityPower.ritualTime.fullRound.title' },
  threeRounds: { modifier: -20, label: 'anima.ui.mystic.entityPower.ritualTime.threeRounds.title' },
  fiveRounds: { modifier: 0, label: 'anima.ui.mystic.entityPower.ritualTime.fiveRounds.title' },
  oneMinute: { modifier: 10, label: 'anima.ui.mystic.entityPower.ritualTime.oneMinute.title' },
  oneHour: { modifier: 20, label: 'anima.ui.mystic.entityPower.ritualTime.oneHour.title' },
  sixHours: { modifier: 30, label: 'anima.ui.mystic.entityPower.ritualTime.sixHours.title' },
  oneDay: { modifier: 40, label: 'anima.ui.mystic.entityPower.ritualTime.oneDay.title' },
  oneWeek: { modifier: 50, label: 'anima.ui.mystic.entityPower.ritualTime.oneWeek.title' },
  oneMonth: { modifier: 60, label: 'anima.ui.mystic.entityPower.ritualTime.oneMonth.title' },
  sixMonths: { modifier: 70, label: 'anima.ui.mystic.entityPower.ritualTime.sixMonths.title' },
  oneYear: { modifier: 80, label: 'anima.ui.mystic.entityPower.ritualTime.oneYear.title' },
  fiveYears: { modifier: 90, label: 'anima.ui.mystic.entityPower.ritualTime.fiveYears.title' },
  tenYears: { modifier: 100, label: 'anima.ui.mystic.entityPower.ritualTime.tenYears.title' },
  overFiftyYears: {
    modifier: 120,
    label: 'anima.ui.mystic.entityPower.ritualTime.overFiftyYears.title'
  }
};

export const DEFAULT_ENTITY_POWER_RITUAL_TIME = 'fiveRounds';
