declare namespace Cypress {
  interface Chainable {
    createActor(name: string): void;

    openActorSheet(name: string): void;

    closeActorSheet(): void;

    changeActorSheetTabTo(
      tab: 'main' | 'secondaries' | 'combat' | 'mystic' | 'domine' | 'elan'
    ): void;
  }
}
