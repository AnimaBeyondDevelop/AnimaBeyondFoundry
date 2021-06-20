declare namespace Cypress {
  interface Chainable {
    createActor(name: string): void;

    openActorSheet(name: string): void;

    closeActorSheet(): void;
  }
}
