/// <reference types="cypress" />

describe('StaticElementsComponent', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('renders main info block with translated title', () => {
    cy.get('section.info-block')
      .should('exist')
      .and('be.visible')

    cy.get('section.info-block h2.info-block-title')
      .should('exist')
      .and('contain.text', 'Informationen')
  })

  it('renders the canton info section', () => {
    cy.get('section.info-block h3.info-block-heading')
      .first()
      .should('contain.text', 'Zweck der Applikation')
  })

  it('renders all info links correctly', () => {
    const links = [
      { title: 'Erneuerbar Heizen', url: 'https://www.erneuerbarheizen.ch/Impulsberatung/' },
      { title: 'Bohrfirmen mit Gütesiegel', url: 'https://www.fws.ch/waermepumpen-spezialisten/' },
      { title: "Wärmepumpen-System-Modul (Qualitätslabel)", url: 'https://www.wp-systemmodul.ch/de/' },
      { title: 'Geothermie', url: 'https://geothermie-schweiz.ch/' },
    ]

    links.forEach((link, i) => {
      cy.get(`.info-block-links a`).eq(i)
        .should('have.attr', 'href', link.url)
        .and('contain.text', link.title)
    })
  })

})
