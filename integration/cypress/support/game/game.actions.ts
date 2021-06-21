import { ActorSheetTabs } from '../../util/ActorSheetTabs';

Cypress.Commands.add('createActor', name => {
  cy.get('#sidebar-tabs a[data-tab="actors"]').click();
  cy.get('#actors button.create-entity').click();

  cy.wait(500);

  cy.get('#entity-create input[name="name"]').type(name);
  cy.get('div.dialog-buttons button').click();
});

Cypress.Commands.add('openActorSheet', name => {
  cy.wait(500);

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
