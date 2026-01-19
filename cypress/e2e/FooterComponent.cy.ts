describe('Footer Component', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('renders the footer with correct background color', () => {
    cy.get('footer.site-footer')
      .should('exist')
      .and('be.visible')
      .and('have.css', 'background-color')
      .then((bgColor) => {
        expect(bgColor).to.eq('rgb(47, 67, 86)');
      });
  });

  it('renders left, center, and right sections', () => {
    cy.get('footer.site-footer .footer-left').should('exist');
    cy.get('footer.site-footer .footer-center').should('exist');
    cy.get('footer.site-footer .footer-right').should('exist');
  });

  it('renders all expected links', () => {
    cy.get('footer.site-footer .footer-center a').should('have.length', 2);

    cy.get('footer.site-footer .footer-center a')
      .eq(0)
      .should('have.attr', 'href')
      .and('include', 'http');

    cy.get('footer.site-footer .footer-center a')
      .eq(1)
      .should('have.attr', 'href', 'mailto:contact@bfe.admin.ch');
  });

  it('renders the copyright year correctly', () => {
    const currentYear = new Date().getFullYear();
    cy.get('footer.site-footer .footer-right p').should('contain.text', currentYear.toString());
  });
});
