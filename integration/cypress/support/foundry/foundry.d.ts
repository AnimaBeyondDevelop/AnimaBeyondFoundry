declare namespace Cypress {
  interface Chainable {
    bootstrap({ password }: { password: string }): void;

    createWorld({ name }: { name: string }): void;

    loadWorld({ name }: { name: string }): void;

    closeNotification(): void;
  }
}
