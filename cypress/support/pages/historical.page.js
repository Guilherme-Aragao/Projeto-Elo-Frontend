class HistoricalPage {
    getTitle() {
        return cy.get('h1').contains('Histórico de Cupons');
    }

    // retorna as linhas da tabela de histórico
    getRows() {
        return cy.get('table tbody tr');
    }


    getOfferNameInput() {
        return cy.get('#searchOfferName');
    }


    // Preenche o campo de data inicial (por padrão: amanhã)
    startDateField() {
        const date = this._formatDateFromNow(1);
        // usa o mesmo seletor que os outros testes (primeiro input de data)
        cy.get('input[placeholder="Selecione a data"]').eq(0).clear().type(date);
    }

    // Preenche o campo de data final (por padrão: 3 dias a partir de hoje)
    endDateField() {
        const date = this._formatDateFromNow(3);
        cy.get('input[placeholder="Selecione a data"]').eq(1).clear().type(date);
    }

    // clicador do botão pesquisar
    SearchButton() {
        return cy.get('#searchHistory').click();
    }

    // --- helpers internos ---
    // retorna data no formato DD/MM/YYYY adicionando `days` ao dia de hoje
    _formatDateFromNow(days) {
        const d = new Date();
        d.setDate(d.getDate() + days);

        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();

        return `${dd}/${mm}/${yyyy}`;
    }
}

export default HistoricalPage;
