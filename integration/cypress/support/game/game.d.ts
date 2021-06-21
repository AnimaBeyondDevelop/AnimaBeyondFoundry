declare namespace Cypress {
  interface Chainable {
    changeTabTo(
      tab:
        | 'chat'
        | 'combat'
        | 'scenes'
        | 'actors'
        | 'items'
        | 'journal'
        | 'tables'
        | 'playlists'
        | 'compendium'
        | 'settings'
    ): void;

    removeAllChatMessages(): void;

    createActor(name: string): void;

    openActorSheet(name: string): void;

    closeActorSheet(): void;

    changeActorSheetTabTo(
      tab: 'main' | 'secondaries' | 'combat' | 'mystic' | 'domine' | 'elan'
    ): void;
  }
}
