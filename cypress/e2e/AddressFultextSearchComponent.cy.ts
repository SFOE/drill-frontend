describe('Address Search E2E', () => {
  const geoAdminResponse = {
    fuzzy: 'true',
    results: [
      {
        id: '983892',
        attrs: { label: 'Ittigenstrasse 13 <b>3063 Ittigen</b>', x: 203045.59, y: 603632.75 },
      },
      {
        id: '843296',
        attrs: { label: 'Chasseralstrasse 13 <b>3063 Ittigen</b>', x: 203252.6, y: 603014.68 },
      },
      {
        id: '857295',
        attrs: { label: 'Baumgartenweg 13 <b>3063 Ittigen</b>', x: 203094.7, y: 603397.62 },
      },
      {
        id: '869351',
        attrs: { label: 'Erlenweg 13 <b>3063 Ittigen</b>', x: 202323.23, y: 603399.37 },
      },
      {
        id: '945172',
        attrs: { label: 'Rain 13 <b>3063 Ittigen</b>', x: 202778.15, y: 603106.87 },
      },
    ],
  }

  beforeEach(() => {
    cy.intercept(
      'GET',
      '**/rest/services/api/SearchServer*',
      { body: geoAdminResponse }
    ).as('getAddresses')

    cy.visit('/')
    cy.get('[data-cy=address-search-input]').should('be.visible')
  })

  it('shows search results returned by GeoAdmin', () => {
    cy.get('[data-cy=address-search-input]')
      .type('papiermühle 13')
      .should('have.value', 'papiermühle 13')

    cy.wait('@getAddresses')

    cy.get('.dropdown-item')
      .should('have.length', geoAdminResponse.results.length)

    cy.get('.dropdown-item').then(items => {
      const labels = [...items].map(el => el.textContent?.trim())

      geoAdminResponse.results.forEach(result => {
        const div = document.createElement('div')
        div.innerHTML = result.attrs.label
        const plainText = div.textContent?.trim()

        expect(labels).to.include(plainText)
      })
    })
  })

  it('clears results when the input is cleared', () => {
    cy.get('[data-cy=address-search-input]').type('test')
    cy.wait('@getAddresses')

    cy.get('.dropdown-item').should('exist')

    cy.get('[data-cy=address-search-input]').clear()

    cy.get('.dropdown-item').should('not.exist')
  })

  it('selects the first result when pressing Enter', () => {
    cy.get('[data-cy=address-search-input]').type('papiermühle')
    cy.wait('@getAddresses')

    cy.get('[data-cy=address-search-input]').type('{enter}')

    cy.get('.dropdown-item').should('not.exist')

    cy.get('[data-cy=address-search-input]')
      .invoke('val')
      .should('contain', 'Ittigen')
  })
})
