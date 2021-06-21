import * as faker from 'faker';

const primaries = ['agi', 'con', 'dex', 'str', 'int', 'per', 'pow', 'will'];
const resistances = ['phyr', 'disr', 'poir', 'magr', 'psyr'];
const commonResources = ['lifePoints', 'fatigue'];

const setValues = (values: string[]) => {
  cy.wrap(values).each(value => {
    cy.get(`input[name="${value}"]`).click();
    cy.wait(100);
    cy.get(`input[name="${value}"]`).type('10');
  });
};

const checkValues = (values: string[]) => {
  cy.wrap(values).each(value => {
    cy.get(`input[name="${value}"]`).should('have.value', '10');
  });
};

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

    cy.createActor(actorName);
    cy.closeActorSheet();
  });

  it('primaries should be preserved', () => {
    cy.openActorSheet(actorName);

    const primariesSelector = primaries.map(
      primary => `data.characteristics.primaries.${primary}.value`
    );

    setValues(primariesSelector);
    cy.closeActorSheet();

    cy.openActorSheet(actorName);
    checkValues(primariesSelector);

    cy.closeActorSheet();
  });

  it('resistances should be preserved', () => {
    cy.openActorSheet(actorName);

    const resistancesSelector = resistances.map(
      resistance => `data.characteristics.secondaries.resistances.${resistance}.value`
    );

    setValues(resistancesSelector);
    cy.closeActorSheet();

    cy.openActorSheet(actorName);
    checkValues(resistancesSelector);

    cy.closeActorSheet();
  });

  it.only('common resources should be preserved', () => {
    cy.openActorSheet(actorName);

    const commonResourcesMaxSelector = commonResources.map(
      resistance => `data.commonResources.${resistance}.max`
    );

    const commonResourcesValueSelector = commonResources.map(
      resistance => `data.commonResources.${resistance}.value`
    );

    setValues(commonResourcesMaxSelector);
    setValues(commonResourcesValueSelector);
    cy.closeActorSheet();

    cy.openActorSheet(actorName);
    checkValues(commonResourcesMaxSelector);
    checkValues(commonResourcesValueSelector);

    cy.closeActorSheet();
  });
});
