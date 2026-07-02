/// <reference types="cypress" />
import { mockDrillCategoryApi, mockDrillCategoryError } from '../support/mock-backend'

/**
 * End-to-end user journey tests.
 *
 * These tests exercise the primary user flow (search → select → view result)
 * and critical error paths that protect against regressions.
 */
describe('User Journey: Search → Select → View Result', () => {
  const geoAdminResponse = {
    results: [
      {
        id: '983892',
        attrs: {
          label: 'Ittigenstrasse 13 <b>3063 Ittigen</b>',
          x: 1200000,
          y: 2600000,
        },
      },
      {
        id: '843296',
        attrs: {
          label: 'Chasseralstrasse 13 <b>3063 Ittigen</b>',
          x: 1200100,
          y: 2600100,
        },
      },
    ],
  }

  beforeEach(() => {
    cy.intercept('GET', '**/rest/services/api/SearchServer*', {
      body: geoAdminResponse,
    }).as('getAddresses')

    cy.visit('/')
    cy.get('[data-cy=address-search-input]').should('be.visible')
  })

  it('selecting an address triggers infobox with correct color', () => {
    mockDrillCategoryApi('suitable')

    // Type to trigger search
    cy.get('[data-cy=address-search-input]').type('Ittigen')
    cy.wait('@getAddresses')

    // Select first result
    cy.get('.dropdown-item').first().click()

    // Dropdown closes
    cy.get('.dropdown-item').should('not.exist')

    // Infobox appears with correct color
    cy.get('.info-box', { timeout: 5000 }).should('exist').and('have.class', 'green')

    // Search input shows selected address text
    cy.get('[data-cy=address-search-input]').should('have.value', 'Ittigenstrasse 13 3063 Ittigen')
  })

  it('selecting an address and then clearing resets the UI', () => {
    mockDrillCategoryApi('suitable')

    cy.get('[data-cy=address-search-input]').type('Ittigen')
    cy.wait('@getAddresses')
    cy.get('.dropdown-item').first().click()
    cy.get('.info-box', { timeout: 5000 }).should('exist')

    // Click clear button
    cy.get('.clear-btn').click()

    // Infobox disappears, input is empty
    cy.get('.info-box').should('not.exist')
    cy.get('[data-cy=address-search-input]').should('have.value', '')
  })

  it('shows error state when backend returns 500', () => {
    mockDrillCategoryError()

    cy.get('[data-cy=address-search-input]').type('Ittigen')
    cy.wait('@getAddresses')
    cy.get('.dropdown-item').first().click()

    cy.wait('@drillCategoryError')

    // Infobox appears with purple (error) color
    cy.get('.info-box', { timeout: 5000 }).should('exist').and('have.class', 'purple')
  })

  it('shows geoservice unavailable state (98) with canton info preserved', () => {
    mockDrillCategoryApi('geoserviceUnavailable')

    cy.get('[data-cy=address-search-input]').type('Ittigen')
    cy.wait('@getAddresses')
    cy.get('.dropdown-item').first().click()

    cy.wait('@drillCategory')

    cy.get('.info-box', { timeout: 5000 }).should('exist').and('have.class', 'purple')
    // Title should mention the canton
    cy.get('.info-box .text h2').should('contain.text', 'BE')
  })

  it('loading spinner appears during fetch and disappears after', () => {
    // Delay the response to make the loading state observable
    cy.intercept('GET', '**/v1/drill-category/**', (req) => {
      req.reply({
        delay: 500,
        statusCode: 200,
        body: {
          coord_x: 2600000,
          coord_y: 1200000,
          canton: 'BE',
          canton_config: {
            legend_url: '',
            cantonal_energy_service_url: 'https://example.com',
            thematic_geoportal_url: 'https://example.com',
          },
          ground_category: {
            layer_results: [],
            harmonized_value: 1,
            source_values: 'test',
          },
        },
      })
    }).as('slowDrillCategory')

    cy.get('[data-cy=address-search-input]').type('Ittigen')
    cy.wait('@getAddresses')
    cy.get('.dropdown-item').first().click()

    // Loading spinner should appear
    cy.get('.loading-overlay').should('exist')

    // After response, spinner goes away and infobox appears
    cy.wait('@slowDrillCategory')
    cy.get('.loading-overlay').should('not.exist')
    cy.get('.info-box').should('exist')
  })
})

describe('Keyboard Navigation', () => {
  const geoAdminResponse = {
    results: [
      { id: '1', attrs: { label: 'Result A', x: 1200000, y: 2600000 } },
      { id: '2', attrs: { label: 'Result B', x: 1200100, y: 2600100 } },
      { id: '3', attrs: { label: 'Result C', x: 1200200, y: 2600200 } },
    ],
  }

  beforeEach(() => {
    cy.intercept('GET', '**/rest/services/api/SearchServer*', {
      body: geoAdminResponse,
    }).as('getAddresses')

    cy.visit('/')
  })

  it('ArrowDown highlights items in sequence', () => {
    cy.get('[data-cy=address-search-input]').type('test')
    cy.wait('@getAddresses')
    cy.get('.dropdown-item').should('have.length', 3)

    cy.get('body').type('{downArrow}')
    cy.get('.dropdown-item').eq(0).should('have.class', 'highlighted')

    cy.get('body').type('{downArrow}')
    cy.get('.dropdown-item').eq(1).should('have.class', 'highlighted')

    cy.get('body').type('{downArrow}')
    cy.get('.dropdown-item').eq(2).should('have.class', 'highlighted')
  })

  it('ArrowUp highlights items in reverse', () => {
    cy.get('[data-cy=address-search-input]').type('test')
    cy.wait('@getAddresses')

    cy.get('body').type('{upArrow}')
    cy.get('.dropdown-item').eq(2).should('have.class', 'highlighted')

    cy.get('body').type('{upArrow}')
    cy.get('.dropdown-item').eq(1).should('have.class', 'highlighted')
  })

  it('Escape closes the dropdown', () => {
    cy.get('[data-cy=address-search-input]').type('test')
    cy.wait('@getAddresses')
    cy.get('.dropdown-item').should('have.length', 3)

    cy.get('body').type('{esc}')
    cy.get('.dropdown-item').should('not.exist')
  })

  it('Enter selects the highlighted item', () => {
    mockDrillCategoryApi('suitable')

    cy.get('[data-cy=address-search-input]').type('test')
    cy.wait('@getAddresses')

    // Navigate to second item and press enter
    cy.get('body').type('{downArrow}{downArrow}')
    cy.get('[data-cy=address-search-input]').type('{enter}')

    // Dropdown closes and input shows selected text
    cy.get('.dropdown-item').should('not.exist')
    cy.get('[data-cy=address-search-input]').should('have.value', 'Result B')
  })
})

describe('URL Query Parameter: ?lang=', () => {
  it('loads the app in French when ?lang=fr is in the URL', () => {
    cy.visit('/?lang=fr')

    // The title should be in French (not German default)
    cy.get('.action-title').should('not.contain.text', 'Kann ich')
    cy.get('.action-title').invoke('text').should('not.be.empty')
  })

  it('loads the app in Italian when ?lang=it is in the URL', () => {
    cy.visit('/?lang=it')

    cy.get('.action-title').should('not.contain.text', 'Kann ich')
    cy.get('.action-title').invoke('text').should('not.be.empty')
  })

  it('defaults to German when no lang param is provided', () => {
    cy.visit('/')

    cy.get('.action-title').should(
      'contain.text',
      'Kann ich an meinem Standort für eine Erdwärmesonde bohren?',
    )
  })
})

describe('Click Outside Closes Dropdown', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/rest/services/api/SearchServer*', {
      body: {
        results: [
          { id: '1', attrs: { label: 'Some Result', x: 100, y: 200 } },
        ],
      },
    }).as('getAddresses')

    cy.visit('/')
  })

  it('clicking outside the search container closes the dropdown', () => {
    cy.get('[data-cy=address-search-input]').type('test')
    cy.wait('@getAddresses')
    cy.get('.dropdown-item').should('have.length', 1)

    // Click on the body outside the search area
    cy.get('body').click(0, 0)

    cy.get('.dropdown-item').should('not.exist')
  })
})
