Cypress.Commands.add('createActor', (name) => {
  cy.get('#sidebar-tabs a[data-tab="actors"]').click();
  cy.get('#actors button.create-entity').click();

  cy.wait(500);

  cy.get('#entity-create input[name="name"]').type(name);
  cy.get('div.dialog-buttons button').click();

  cy.get('.window-app');
});
