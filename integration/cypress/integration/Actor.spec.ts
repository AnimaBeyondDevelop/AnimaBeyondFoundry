import * as faker from 'faker';

const primaries = ['agi', 'con', 'dex', 'str', 'int', 'per', 'pow', 'will'];

describe('Anima Beyond Fantasy Actors', () => {
  let actorName: string = faker.internet.userName();

  before(() => {
    cy.clearLocalStorage();
    cy.clearCookies();

    actorName = faker.internet.userName();

    const worldName = Date.now().toString();

    cy.bootstrap({ password: Cypress.env('foundryAdminPassword') });
    cy.createWorld({ name: worldName });
    cy.loadWorld({ name: worldName });
  });

  it('could be created', () => {
    cy.createActor(actorName);
    cy.closeActorSheet();
  });

  it('primaries should be preserved', () => {
    cy.openActorSheet(actorName);
    cy.wrap(primaries).each(primary => {
      cy.get(`input[name="data.characteristics.primaries.${primary}.value"]`).click();
      cy.wait(100);
      cy.get(`input[name="data.characteristics.primaries.${primary}.value"]`).type('10');
    });
    cy.closeActorSheet();

    cy.openActorSheet(actorName);
    cy.wrap(primaries).each(primary => {
      cy.get(`input[name="data.characteristics.primaries.${primary}.value"]`).should(
        'have.value',
        '10'
      );
    });
  });
});
