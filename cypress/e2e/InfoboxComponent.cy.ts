/// <reference types="cypress" />
import { mockDrillCategoryApi, mockGeoadminSearch } from '../support/mock-backend'

describe('Infobox Component', () => {
  beforeEach(() => {
    // Load the app before each test
    cy.visit('/')

    // Wait for map to fully load - wait for canvas to have proper dimensions
    cy.get('.ol-viewport canvas', { timeout: 50000 })
      .should(($canvas) => {
        const canvas = $canvas[0] as HTMLCanvasElement
        expect(canvas.width).to.be.greaterThan(0)
        expect(canvas.height).to.be.greaterThan(0)
      })
  })

  it('does not render infobox when no data is selected', () => {
    // Initially, without selecting a location, infobox should not be visible
    cy.get('.info-box').should('not.exist')
  })

  it('renders infobox with icon and title', () => {
    // Mock backend to return suitable response
    mockDrillCategoryApi('suitable')

    // Trigger API call by clicking canvas
    cy.get('.ol-viewport canvas').click('center')

    // Wait for infobox to appear
    cy.get('.info-box', { timeout: 5000 }).should('exist')

    // Check that the icon is visible
    cy.get('.info-box .icon img').should('exist').and('be.visible')

    // Check that the title (h2) is visible
    cy.get('.info-box .text h2').should('exist').and('be.visible')
  })


  it('displays selected address when using search bar', () => {

    mockGeoadminSearch()

    // Type in search bar and press enter
    cy.get('.input-wrapper input').type('L\'Auge-du-Bois 1 2616 Renan BE{enter}')

    // Wait for infobox to appear
    cy.wait(6000)
    cy.get('.info-box').should('exist')

    // Check that the selected address is displayed and is consistent
    cy.get('.info-box .selected-address').should('exist').and('be.visible').and('have.text', 'L\'Auge-du-Bois 1 2616 Renan BE')
  })

  it('infobox has correct color class for suitable (harmonized value = 1)', () => {
    // Mock backend to return suitable response
    mockDrillCategoryApi('suitable')

    // Trigger API call by clicking canvas
    cy.get('.ol-viewport canvas').click('center')

    //verify it has the right color class
    cy.get('.info-box').then(($infobox) => {
      expect($infobox.attr('class')).to.contain('green')
    })
  })

  it('infobox has correct color class for with restrictions (harmonized value = 2)', () => {
    // Mock backend to return suitable response
    mockDrillCategoryApi('withRestrictions')

    // Trigger API call by clicking canvas
    cy.get('.ol-viewport canvas').click('center')

    //verify it has the right color class
    cy.get('.info-box').then(($infobox) => {
      expect($infobox.attr('class')).to.contain('orange')
    })
  })

  it('infobox has correct color class for forbidden (harmonized value = 3)', () => {
    // Mock backend to return suitable response
    mockDrillCategoryApi('forbidden')

    // Trigger API call by clicking canvas
    cy.get('.ol-viewport canvas').click('center')

    //verify it has the right color class
    cy.get('.info-box').then(($infobox) => {
      expect($infobox.attr('class')).to.contain('red')
    })
  })

  it('infobox has correct color class for unavailable (harmonized value = 4)', () => {
    // Mock backend to return suitable response
    mockDrillCategoryApi('unknown')

    // Trigger API call by clicking canvas
    cy.get('.ol-viewport canvas').click('center')

    //verify it has the right color class
    cy.get('.info-box').then(($infobox) => {
      expect($infobox.attr('class')).to.contain('blue')
    })
  })

  it('infobox has correct color class for outside CH (harmonized value = 6)', () => {
    // Mock backend to return suitable response
    mockDrillCategoryApi('outOfSwitzerland')

    // Trigger API call by clicking canvas
    cy.get('.ol-viewport canvas').click('center')

    //verify it has the right color class
    cy.get('.info-box').then(($infobox) => {
      expect($infobox.attr('class')).to.contain('blue')
    })
  })

  it('infobox has correct color class for error (harmonized value = 99)', () => {
    // Mock backend to return suitable response
    mockDrillCategoryApi('error')

    // Trigger API call by clicking canvas
    cy.get('.ol-viewport canvas').click('center')

    //verify it has the right color class
    cy.get('.info-box').then(($infobox) => {
      expect($infobox.attr('class')).to.contain('purple')
    })
  })

  it('shows expand button on mobile when infobox is rendered', () => {
    // Mock backend to return suitable response
    mockDrillCategoryApi('suitable')

    // Set mobile viewport
    cy.viewport('iphone-x')

    // Trigger API call by clicking canvas
    cy.get('.ol-viewport canvas').click('center')

    // Wait for infobox to appear
    cy.get('.info-box', { timeout: 5000 }).should('exist')

    // On mobile, there should be an expand button
    cy.get('.info-box .expand-cta').should('exist').and('be.visible')
  })

  it('expands and collapses details on mobile when clicking expand button', () => {
    // Mock backend to return suitable response
    mockDrillCategoryApi('suitable')

    // Set mobile viewport
    cy.viewport('iphone-x')

    // Trigger API call by clicking canvas
    cy.get('.ol-viewport canvas').click('center')

    // Wait for infobox to appear
    cy.get('.info-box', { timeout: 5000 }).should('exist')

    // Initially, details should be hidden
    cy.get('.info-box .details').should('not.be.visible')

    // Click expand button
    cy.get('.info-box .expand-cta').click()

    // Details should now be visible
    cy.get('.info-box .details').should('be.visible')

    // Click expand button again to collapse
    cy.get('.info-box .expand-cta').click()

    // Details should be hidden again
    cy.get('.info-box .details').should('not.be.visible')
  })


  it('displays links when available', () => {
    // Mock backend to return suitable response with links
    mockDrillCategoryApi('suitable')

    // Trigger API call by clicking canvas
    cy.get('.ol-viewport canvas').click('center')

    // Wait for infobox to appear
    cy.get('.info-box', { timeout: 5000 }).should('exist')

    // If needed to expand then do it, otherwise don't
    cy.get('.info-box').then(() => {
      if (cy.get('.info-box .expand-cta').should('be.visible')) {
        cy.get('.info-box .expand-cta').click()
      }
    })

    // Check if links container exists (it appears conditionally)
    cy.get('.links-container').then(($sourceValues) => {
      if ($sourceValues.length > 0) {
        cy.wrap($sourceValues).should('be.visible')
      }
    })
  })
})
