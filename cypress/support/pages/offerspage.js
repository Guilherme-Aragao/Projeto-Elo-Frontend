class OffersPage {

    bottonNewOffers() {
        cy.contains('button', 'Nova Oferta').click();
    }

    uploadOfferImage() {
        cy.get('label input[type="file"]').selectFile(
            'cypress/fixtures/images/oferta.jpg',
            { force: true }
        );
    }

    bottonConfirmUploadImage() {
        cy.contains('button', 'Confirmar e Cortar').click();
    };

    selectFieldNameOffer(nameOffer) {
        cy.get('#offerName').eq(0).clear().type(nameOffer);
    }

    descriptionField(text) {
        cy.get('#offerDescription').clear().type(text);
    }

    productCodeField(code) {
        cy.get('#productCode').clear().type(code)
    }

    quantityField(amount) {
        cy.get('#offerQuantity').clear().type(amount);
    }



    endDateField(date) {
        cy.get('input[placeholder]').eq(4).type(date);
    }

    buildFutureDateTime(daysFromToday = 0, hours = 9, minutes = 0) {
        const d = new Date();

        d.setDate(d.getDate() + daysFromToday);
        d.setHours(hours, minutes, 0, 0);

        const dia = String(d.getDate()).padStart(2, '0');
        const mes = String(d.getMonth() + 1).padStart(2, '0'); // mês começa em 0
        const ano = d.getFullYear();

        const hora = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');

        // formato que o input espera: DD/MM/YYYY HH:mm
        return `${dia}/${mes}/${ano} ${hora}:${min}`;
    }

    // -------- campos de data --------

    // Data de início: amanhã às X (por padrão 09:00)
    startDateField(daysFromToday = 1, hours = 9, minutes = 0) {
        const date = this.buildFutureDateTime(daysFromToday, hours, minutes);

        cy.contains('label', 'Data de Início')
            .parent()           // container label + input
            .find('input')      // o input de data/hora
            .clear()
            .type(date);
    }

    // Data de término: N dias a partir de hoje (ou a partir do início, você escolhe)
    endDateField(daysFromToday = 3, hours = 18, minutes = 0) {
        const date = this.buildFutureDateTime(daysFromToday, hours, minutes);

        cy.contains('label', 'Data de Término')
            .parent()
            .find('input')
            .clear()
            .type(date);
    }

    selectRandomCategory() {
        cy.get('select').eq(1).then($select => {
            const options = $select.find('option');

            // Remove a opção "Selecione uma categoria"
            const validOptions = options.slice(1);

            // gera índice aleatório
            const randomIndex = Math.floor(Math.random() * validOptions.length);

            const randomValue = validOptions[randomIndex].value;

            // seleciona pelo value
            cy.get('select').eq(1).select(randomValue);
        });
    }

    bottonSaveOffer() {
        cy.get('#saveOffer').click();
    }


    listValidation(offerName) {
        cy.contains('td', offerName).should('be.visible');
    }

    requiredFieldError() {
        cy.get('input[type="number"]').first().then(($el) => {
            expect($el[0].validity.valid).to.be.false;
            expect($el[0].validationMessage).to.contain('Preencha este campo');
        });
    }

    editButton() {
        cy.get('tbody tr').eq(0).within(() => {
            cy.get('button[title="Editar"]').click();
        });

    }

    deleteButton() {
        cy.get('tbody tr').eq(0).within(() => {
            cy.get('button[title="Excluir"]').click();
        });
    }

    confirmDeleteButton() {
        cy.get('#confirmDelete').click();
    }

    deleteValidation() {
        cy.get('tbody tr').eq(0)
        cy.contains('Inativo').should('be.visible');
    }

    viewDetailsButton() {
        cy.get('tbody tr').eq(0).within(() => {
            cy.get('button[title="Visualizar"]').click();
        });
    }

    validateOfferDetails() {
        // exemplo direto no teste
        cy.contains('p.text-sm', 'Quantidade')
            .next()                       // pega o <p> com o valor (ou span)
            .should('be.visible')
            .invoke('text')
            .then(t => expect(t.trim()).to.not.equal(''));

        cy.contains('p.text-sm', 'Código do Produto')
            .next()
            .should('be.visible')
            .invoke('text')
            .then(t => expect(t.trim()).to.not.equal(''));

        cy.contains('p.text-sm', 'Categoria')
            .next()
            .should('be.visible')
            .invoke('text')
            .then(t => expect(t.trim()).to.not.equal(''));

        // e assim por diante para Data de Início, Data de Término, Status...

    }



}
export default new OffersPage();