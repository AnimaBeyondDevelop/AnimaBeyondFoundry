import { calculateMassLifePoints } from '../calculateMassLifePoints.js';
import { openCalculateMassLifeDialog } from '../../../utils/dialogs/openCalculateMassLifeDialog.js';

/**
 * Opens the calculate-mass-life dialog and updates actor life points.
 */
export async function calculateMassLife(sheet) {
  await sheet._flushPendingSheetUpdatesImmediately?.();

  const actor = sheet.actor;
  const settings = actor.system?.general?.settings;
  if (!settings?.massOfEnemies?.value) {
    return ui.notifications.warn(
      game.i18n.localize('anima.ui.settings.massSettings.calculateLife.errors.notMass')
    );
  }

  const individualLife = Number(settings.individualLife?.value) || 0;
  if (individualLife <= 0) {
    return ui.notifications.warn(
      game.i18n.localize('anima.ui.settings.massSettings.calculateLife.errors.noIndividualLife')
    );
  }

  const initialValue = Number(settings.massMemberCount?.value) || 1;
  const memberCount = await openCalculateMassLifeDialog({ initialValue });
  if (!memberCount) return;

  const damageAccumulation = !!settings.damageAccumulation?.value;
  const lifePoints = calculateMassLifePoints({
    individualLife,
    memberCount,
    damageAccumulation
  });

  await actor.update({
    'system.general.settings.massMemberCount.value': memberCount,
    'system.characteristics.secondaries.lifePoints.max': lifePoints,
    'system.characteristics.secondaries.lifePoints.value': lifePoints
  });

  await sheet.render(false);

  ui.notifications.info(
    game.i18n.format('anima.ui.settings.massSettings.calculateLife.success', {
      lifePoints,
      memberCount
    })
  );
}
