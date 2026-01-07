describe('Address Search E2E', () => {
  const geoAdminResponse = {
    fuzzy: 'true',
    results: [
      { id: '983892', attrs: { label: 'Ittigenstrasse 13 <b>3063 Ittigen</b>', x: 203045.59375, y: 603632.75 } },
      { id: '843296', attrs: { label: 'Chasseralstrasse 13 <b>3063 Ittigen</b>', x: 203252.609375, y: 603014.6875 } },
      { id: '857295', attrs: { label: 'Baumgartenweg 13 <b>3063 Ittigen</b>', x: 203094.703125, y: 603397.625 } },
      { id: '869351', attrs: { label: 'Erlenweg 13 <b>3063 Ittigen</b>', x: 202323.234375, y: 603399.375 } },
      { id: '945172', attrs: { label: 'Rain 13 <b>3063 Ittigen</b>', x: 202778.15625, y: 603106.875 } },
    ],
  };

  beforeEach(() => {
    cy.intercept(
      'GET',
      '**/rest/services/api/SearchServer*',
      { body: geoAdminResponse }
    ).as('getAddresses');

    cy.visit('/');
    cy.get('[data-cy=address-search-input]').should('be.visible');
  });

  it('searches addresses and displays all results from GeoAdmin API', () => {
    cy.get('[data-cy=address-search-input]')
      .type('papiermuhle 13, ittigen');

    cy.wait('@getAddresses');

    cy.get('.dropdown-item').should('have.length', 5);

    geoAdminResponse.results.forEach((result, index) => {
      const plainLabel = result.attrs.label.replace(/<[^>]*>/g, '');
      cy.get('.dropdown-item').eq(index).should('contain', plainLabel);
    });
  });

  it('clears results when input is cleared', () => {
    cy.get('[data-cy=address-search-input]').as('addressInput');

    cy.get('@addressInput').type('test');
    cy.wait('@getAddresses');

    cy.get('.dropdown-item').should('have.length', 5);

    cy.get('@addressInput').clear();

    cy.get('.dropdown-item').should('not.exist');
  });
});
