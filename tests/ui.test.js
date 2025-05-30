describe('UI Tests for URL Redirector', () => {
    beforeEach(() => {
        // Visit the application before each test
        cy.visit('http://localhost:80'); // Adjust the URL as necessary
    });

    it('should add a new redirect', () => {
        cy.get('#acronym').type('test');
        cy.get('#destination').type('https://www.google.com');
        cy.get('button').contains('Save Redirect').click();

        // Verify that the redirect is displayed in the table
        cy.get('tbody').contains('test');
        cy.get('tbody').contains('https://www.google.com');
    });

    it('should delete a redirect', () => {
        // First, add a redirect to delete
        cy.get('#acronym').type('test');
        cy.get('#destination').type('https://www.google.com');
        cy.get('button').contains('Save Redirect').click();

        // Now delete the redirect
        cy.get('button').contains('Delete').click();

        // Verify that the redirect is no longer displayed
        cy.get('tbody').should('not.contain', 'test');
    });
});
