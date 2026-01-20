/// <reference types="cypress" />

describe('Language Switcher Component', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('switches language to German (DE) and updates header', () => {
    // Select German
    cy.get('.top-header-inner select').select('DE')

    // Start a new chain for the header assertion
    cy.get('.bottom-header-inner .title')
      .should('exist')
      .and('be.visible')
      .and('have.text', 'Bundesamt für Energie BFE')
  })

  it('can switch back to English (EN)', () => {
    // First switch to DE
    cy.get('.top-header-inner select').select('DE')

    // Then switch back to EN
    cy.get('.top-header-inner select').select('EN')

    // Start a new chain for the header assertion
    cy.get('.bottom-header-inner .title')
      .should('exist')
      .and('be.visible')
      .and('have.text', 'Swiss Federal Office of Energy SFOE')
  })
})
