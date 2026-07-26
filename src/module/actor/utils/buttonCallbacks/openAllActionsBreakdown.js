import { AllActionsBreakdownDialog } from '../../../dialogs/AllActionsBreakdownDialog.js';
import { renderChildAppAboveParent } from '../childAppStacking.js';

/**
 * Open the all-actions modifier breakdown dialog from the actor sheet header.
 * @param {import('../../ABFActorSheet').default} sheet
 */
export function openAllActionsBreakdown(sheet) {
  const actor = sheet?.actor;
  if (!actor || !sheet) return;
  renderChildAppAboveParent(sheet, new AllActionsBreakdownDialog(actor));
}

openAllActionsBreakdown.action = 'openAllActionsBreakdown';
