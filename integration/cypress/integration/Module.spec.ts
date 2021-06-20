describe('Anima Beyond Fantasy Module', () => {
  let worldName: string = Date.now().toString();

  before(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  beforeEach(() => {
    worldName = Date.now().toString();

    cy.bootstrap({ password: Cypress.env('foundryAdminPassword') });
  });

  it('must be installed', () => {
    cy.get('a[data-tab="systems"]').click();
    cy.get('h3.package-title').then($list => {
      expect($list.toArray().some(el => el.innerText === 'Anima Beyond Fantasy')).to.be
        .true;
    });
  });

  it('can load a world', () => {
    cy.createWorld({ name: worldName });
    cy.loadWorld({ name: worldName });
  });
});
