import * as faker from 'faker';

describe('Anima Beyond Fantasy Actors', () => {
  let actorName: string = faker.internet.userName();

  before(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  beforeEach(() => {
    actorName = faker.internet.userName();

    const worldName = Date.now().toString();

    cy.bootstrap({ password: Cypress.env('foundryAdminPassword') });
    cy.createWorld({ name: worldName });
    cy.loadWorld({ name: worldName });
  });

  it('could be created', () => {
    cy.createActor(actorName);
  });
});
