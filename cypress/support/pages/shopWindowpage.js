class ShopWindowPage {

    visit() {
        cy.visit('/vitrine');
    }

    uploadStoreImage() {
        cy.get('input[type="file"]').selectFile(
            'cypress/fixtures/images/storeImage.jpg',
            { force: true }
        );
    }

    bottonConfirmUploadImage() {
        cy.contains('button', 'Confirmar e Cortar').click();
    }

    bottonSaveImage() {
        cy.get('#saveImages').click();
    }


    verifyAmountImage() {
        cy.get('div[draggable="true"]').then($before => {
            const beforeCount = $before.length;
            // salva como alias para usar depois
            cy.wrap(beforeCount).as('beforeCount');
        });
    }
    verifyAmountImageAfterUpload() {
        // pega o alias salvo
        cy.get('@beforeCount').then(beforeCount => {
            cy.get('div[draggable="true"]', { timeout: 10000 }).should($after => {
                expect($after.length).to.be.greaterThan(beforeCount);
            });
        });
    }

    mouseOverFirstImage() {
        cy.get('div[draggable="true"]').first().trigger('mouseover');
    }

    deleteFirstImage() {
        this.mouseOverFirstImage();
        cy.get('#removeImage0').first().click();
    }



    verifyAmountImageAfterDelete() {
        // pega o alias salvo
        cy.get('@beforeCount').then(beforeCount => {
            cy.get('div[draggable="true"]', { timeout: 10000 }).should($after => {
                expect($after.length).to.be.lessThan(beforeCount);
            });
        });
    }






















}






























export default new ShopWindowPage();