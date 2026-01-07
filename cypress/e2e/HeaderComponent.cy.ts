/// <reference types="cypress" />

describe('Header Component', () => {
  beforeEach(() => {
    // Load the app before each test
    cy.visit('/')
  })

  it('renders the logo in the header', () => {
    // Check the logo exists and is visible
    cy.get('.logo-title-group .logo')
      .should('exist')
      .and('be.visible')
  })

  it('header is visible and has height', () => {
    cy.get('header.app-header')
      .should('exist')
      .and('be.visible')
      .invoke('outerHeight')
      .should('be.gt', 0) // ensure header height is greater than 0
  })
})
