Cypress.Commands.add('bootstrap', ({ password }) => {
  cy.visit('http://localhost:30000/');

  cy.url().then(url => {
    if (url === 'http://localhost:30000/join') {
      cy.get('input[name="adminKey"]').type(password);
      cy.get('button[data-action="shutdown"]').click();
    } else {
      cy.get('#key').type(password);
      cy.get('button[type="submit"]').click();
    }

    cy.wait(500);
    cy.get('.notification.info').find('.close').click();
  });
});

Cypress.Commands.add('createWorld', ({ name }) => {
  cy.get('a[data-tab="worlds"]').click();

  cy.get('#create-world').click();
  cy.wait(500);

  cy.get('input[name="title"]').type(name);
  cy.get('input[name="name"]').type(name);
  cy.get('select[name="system"]').select('animabf');

  cy.get('.window-content > form > button[type="submit"]').click();
});

Cypress.Commands.add('loadWorld', ({ name }) => {
  cy.get('a[data-tab="worlds"]').click();

  cy.get(`li[data-package-id="${name}"]`).find('button[name="action"]').click();

  cy.url().should('eq', 'http://localhost:30000/join');

  cy.get('select[name="userid"]').select('Gamemaster');
  cy.get('button[data-action="join"]').click();

  cy.wait(2000);

  cy.url().should('eq', 'http://localhost:30000/game');
});
