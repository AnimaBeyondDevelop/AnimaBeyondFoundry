import * as faker from 'faker';
import { ActorSheetTabs } from '../util/ActorSheetTabs';
import { GameTabs } from '../util/GameTabs';

const fields = {
  characteristics: {
    primaries: ['agi', 'con', 'dex', 'str', 'int', 'per', 'pow', 'will'],
    secondaries: ['initiative', 'movement'],
    secondaries_resistances: ['phyr', 'disr', 'poir', 'magr', 'psyr']
  },
  general: ['lifePoints', 'fatigue'],
  secondaries: {
    athletics: ['acrobatics', 'athleticism', 'ride', 'swim', 'climb', 'jump', 'piloting'],
    vigor: ['composure', 'featsOfStrength', 'withstandPain'],
    perception: ['notice', 'search', 'track'],
    intellectual: [
      'animals',
      'science',
      'law',
      'herbalLore',
      'history',
      'tactics',
      'medicine',
      'memorize',
      'navigation',
      'occult',
      'appraisal',
      'magicAppraisal'
    ],
    social: [
      'style',
      'intimidate',
      'leadership',
      'persuasion',
      'trading',
      'streetwise',
      'etiquette'
    ],
    subterfuge: [
      'lockPicking',
      'disguise',
      'hide',
      'theft',
      'stealth',
      'trapLore',
      'poisons'
    ],
    creative: [
      'art',
      'dance',
      'forging',
      'runes',
      'alchemy',
      'animism',
      'music',
      'sleightOfHand',
      'ritualCalligraphy',
      'jewelry',
      'tailoring'
    ]
  }
};

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

  it('resistances should be preserved', () => {
    cy.openActorSheet(actorName);

    const resistancesSelector = fields.characteristics.secondaries_resistances.map(
      resistance => `data.characteristics.secondaries.resistances.${resistance}.value`
    );

    setValues(resistancesSelector);
    cy.closeActorSheet();

    cy.openActorSheet(actorName);
    checkValues(resistancesSelector);

    cy.closeActorSheet();
  });

  it('common resources should be preserved', () => {
    cy.openActorSheet(actorName);

    const generalMaxSelector = fields.general.map(
      value => `data.general.${value}.max`
    );

    const generalValueSelector = fields.general.map(
      value => `data.general.${value}.value`
    );

    setValues(generalMaxSelector);
    setValues(generalValueSelector);
    cy.closeActorSheet();

    cy.openActorSheet(actorName);
    checkValues(generalMaxSelector);
    checkValues(generalValueSelector);

    cy.closeActorSheet();
  });

  describe('characteristics', () => {
    it('primaries should be preserved', () => {
      cy.openActorSheet(actorName);

      const primariesSelector = fields.characteristics.primaries.map(
        primary => `data.characteristics.primaries.${primary}.value`
      );

      setValues(primariesSelector);
      cy.closeActorSheet();

      cy.openActorSheet(actorName);
      checkValues(primariesSelector);

      cy.closeActorSheet();
    });

    it('secondaries should be preserved', () => {
      cy.openActorSheet(actorName);

      const mainSecondariesSelector = fields.characteristics.secondaries.map(
        value => `data.characteristics.secondaries.${value}.value`
      );

      setValues(mainSecondariesSelector);
      cy.closeActorSheet();

      cy.openActorSheet(actorName);
      checkValues(mainSecondariesSelector);

      cy.closeActorSheet();
    });
  });

  describe('secondary', () => {
    beforeEach(() => {
      cy.openActorSheet(actorName);
      cy.changeActorSheetTabTo(ActorSheetTabs.Secondaries);
    });

    afterEach(() => {
      cy.closeActorSheet();
    });

    it('athletics skills should be preserved', () => {
      const athleticsSelector = fields.secondaries.athletics.map(
        value => `data.secondaries.athletics.${value}.value`
      );

      setValues(athleticsSelector);
      cy.closeActorSheet();

      cy.openActorSheet(actorName);
      checkValues(athleticsSelector);
    });

    it('vigor skills should be preserved', () => {
      const vigorSelector = fields.secondaries.vigor.map(
        value => `data.secondaries.vigor.${value}.value`
      );

      setValues(vigorSelector);
      cy.closeActorSheet();

      cy.openActorSheet(actorName);
      checkValues(vigorSelector);
    });

    it('perception skills should be preserved', () => {
      const perceptionSelector = fields.secondaries.perception.map(
        value => `data.secondaries.perception.${value}.value`
      );

      setValues(perceptionSelector);
      cy.closeActorSheet();

      cy.openActorSheet(actorName);
      checkValues(perceptionSelector);
    });

    it('intellectual skills should be preserved', () => {
      const intellectualSelector = fields.secondaries.intellectual.map(
        value => `data.secondaries.intellectual.${value}.value`
      );

      setValues(intellectualSelector);
      cy.closeActorSheet();

      cy.openActorSheet(actorName);
      checkValues(intellectualSelector);
    });

    it('subterfuge skills should be preserved', () => {
      const subterfugeSelector = fields.secondaries.subterfuge.map(
        value => `data.secondaries.subterfuge.${value}.value`
      );

      setValues(subterfugeSelector);
      cy.closeActorSheet();

      cy.openActorSheet(actorName);
      checkValues(subterfugeSelector);
    });

    it('social skills should be preserved', () => {
      const socialSelector = fields.secondaries.social.map(
        value => `data.secondaries.social.${value}.value`
      );

      setValues(socialSelector);
      cy.closeActorSheet();

      cy.openActorSheet(actorName);
      checkValues(socialSelector);
    });

    it('creative skills should be preserved', () => {
      const creativeSelector = fields.secondaries.creative.map(
        value => `data.secondaries.creative.${value}.value`
      );

      setValues(creativeSelector);
      cy.closeActorSheet();

      cy.openActorSheet(actorName);
      checkValues(creativeSelector);
    });

    // TODO Create when psychic branch merge
    it.skip('custom skills should be preserved', () => {
      cy.get('div.special-control a.skillcreate').click();

      cy.closeActorSheet();

      cy.openActorSheet(actorName);
    });
  });

  describe.only('rolls', () => {
    it('d10 can be rolled', () => {
      cy.removeAllChatMessages();

      cy.changeTabTo(GameTabs.Actors);

      cy.openActorSheet(actorName);

      cy.get('span.rollable[data-roll="1d10"]').click();

      cy.wait(300);

      cy.get('.window-app div.dialog-buttons button').click();

      cy.changeTabTo(GameTabs.Chat);

      cy.get('#chat li.chat-message h4.dice-total');
    });
  });
});
