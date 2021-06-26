import { ActorSheetTabs } from '../../util/ActorSheetTabs';
import { GameTabs } from '../../util/GameTabs';

Cypress.Commands.add('changeTabTo', (tab: GameTabs) => {
  cy.get(`#sidebar-tabs a[data-tab="${tab}"]`).click();
});

Cypress.Commands.add('removeAllChatMessages', () => {
  cy.changeTabTo(GameTabs.Chat);

  cy.get('body').then($body => {
    const selector = '#chat li.chat-message a.button.message-delete';

    if ($body.find(selector).length) {
      cy.get(selector).each($el => {
        return cy.wrap($el).click();
      });
    }
  });
});

Cypress.Commands.add('createActor', name => {
  cy.changeTabTo(GameTabs.Actors);
  cy.get('#actors button.create-entity').click();

  cy.wait(500);

  cy.get('#entity-create input[name="name"]').type(name);
  cy.get('div.dialog-buttons button').click();
});

Cypress.Commands.add('openActorSheet', name => {
  cy.wait(500);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  cy.get('#actors h4.entity-name').each(($el, _, __) => {
    if ($el.text() === name) {
      cy.wrap($el).click();
    }
  });

  cy.wait(500);
});

Cypress.Commands.add('closeActorSheet', () => {
  cy.wait(500);
  cy.get('.window-app a.header-button.close').click();
  cy.wait(500);
});

Cypress.Commands.add('changeActorSheetTabTo', (tab: ActorSheetTabs) => {
  cy.get(`nav.sheet-tabs.tabs a[data-tab="${tab}"]`).click();
});
