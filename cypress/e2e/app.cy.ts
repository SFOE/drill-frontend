/// <reference types="cypress" />

describe('App E2E Tests', () => {
  beforeEach(() => {
    // Load your app's root URL
    cy.visit('/')
  })

  it('toggles legend when legend button is clicked', () => {
    // Ensure legend is initially hidden
    cy.get('.legend-container').should('not.be.visible')

    // Click the toggle button
    cy.get('.legend-toggle-btn').click()

    // Legend should now be visible
    cy.get('.legend-container').should('be.visible')

    // Click again to hide
    cy.get('.legend-toggle-btn').click()
    cy.get('.legend-container').should('not.be.visible')
  })

  it('switches language with LanguageSwitcherComponent', () => {
    cy.get('.language-switcher select').select('DE')
    cy.contains('Legende').should('exist')
  })

})
