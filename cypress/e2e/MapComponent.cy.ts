/// <reference types="cypress" />

describe('Map E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('renders the OpenLayers map', () => {
    // Map container exists
    cy.get('.map-component')
      .should('exist')
      .and('be.visible')

    // OpenLayers viewport is created
    cy.get('.ol-viewport')
      .should('exist')
      .and('be.visible')

    // Canvas is rendered
    cy.get('.ol-viewport canvas')
      .should('exist')
      .then(($canvas) => {
        const canvas = $canvas[0] as HTMLCanvasElement
        expect(canvas.width).to.be.greaterThan(0)
        expect(canvas.height).to.be.greaterThan(0)
      })
  })

  it('allows clicking on the map', () => {
    // Click roughly in the center of the map
    cy.get('.map-component')
      .click('center')

    // Map should still be present (no crash)
    cy.get('.ol-viewport').should('exist')
  })

  it('switches language with LanguageSwitcherComponent', () => {
    cy.get('.language-switcher select').select('DE')
    cy.contains('Legende').should('exist')
  })
})
