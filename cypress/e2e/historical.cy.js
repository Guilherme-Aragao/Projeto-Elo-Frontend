import HistoricalPage from "../support/pages/historical.page";

describe('Histórico - Elo (clean spec)', () => {
    const historical = new HistoricalPage();

    beforeEach(() => {
        cy.session('lojistaSession', () => {
            cy.loginLojista();
        });
        cy.visit('/historico');
    });

    it.only('should display histórico list and allow searching by offer name', () => {
        historical.getTitle().should('contain.text', 'Histórico de Cupons');
        historical.getRows().should('have.length.greaterThan', 0);
        historical.getRows()
            .first()
            .find('td')
            .eq(0)
            .invoke('text')
            .then((offerName) => {
                const cleanName = offerName.trim();
                historical.getOfferNameInput()
                    .should('be.visible')
                    .clear()
                    .type(cleanName);
                historical.SearchButton()
                historical.getRows()
                    .should('have.length.greaterThan', 0)
                    .first()
                    .should('contain.text', cleanName);
            });
    });

    it.only('should apply date filter and validate list or empty state', () => {
        historical.startDateField();
        historical.endDateField();
        historical.SearchButton();

        // espera até que exista pelo menos uma linha OU a mensagem de lista vazia
        cy.get('tbody', { timeout: 10000 }).should($tbody => {
            const rows = $tbody.find('tr');
            const emptyMessage = $tbody.find(':contains("Nenhum registro encontrado")');

            // a asserção dentro de `should` será retried até que seja verdadeira
            expect(rows.length > 0 || emptyMessage.length > 0).to.be.true;
        });
    });

})
