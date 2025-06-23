export default class ABFCombatant extends Combatant {
  _getInitiativeFormula() {
    return this.actor?.system?.general?.diceSettings?.initiativeDie?.value || '1d100Initiative';
  }
}