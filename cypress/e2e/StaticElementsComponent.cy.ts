/// <reference types="cypress" />

describe('StaticElementsComponent', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('renders main info block with translated title', () => {
    cy.get('section.info-block')
      .should('exist')
      .and('be.visible')

    cy.get('section.info-block h2.info-block__title')
      .should('exist')
      .and('contain.text', 'Informationen')
  })

  it('renders the canton info section', () => {
    cy.get('section.info-block h3.info-block__heading')
      .first()
      .should('contain.text', 'Weitere Informationen des Kantons')
  })

  it('renders all info links correctly', () => {
    const links = [
      { title: 'Alle Bohrfirmen mit Gütesiegel', url: 'https://www.fws.ch/waermepumpen-spezialisten/' },
      { title: "Das Wärmepumpen-System-Modul, ein Qualitätslabel für Anlagen bis 15 kW", url: 'https://www.wp-systemmodul.ch/de/' },
      { title: 'Geothermie', url: 'https://geothermie-schweiz.ch/' },
    ]

    links.forEach((link, i) => {
      cy.get(`.info-block__links a`).eq(i)
        .should('have.attr', 'href', link.url)
        .and('contain.text', link.title)
    })
  })

  it('renders hints and CTA button', () => {
    cy.get('.info-block__text').should('have.length.at.least', 4)
    cy.get('a.hint-button')
      .should('exist')
      .and('have.attr', 'href', 'https://www.chauffezrenouvelable.ch/')
      .and('contain.text', 'Erneuerbar Heizen')
  })
})
