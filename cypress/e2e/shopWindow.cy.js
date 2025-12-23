import ShopWindowpage from "../support/pages/shopWindowpage";

describe('Shop Window - Elo (clean spec)', () => {
    beforeEach(() => {
        cy.session('lojistaSession', () => {
            cy.loginLojista();
        });
        cy.visit('/vitrine');
    });

    it('add store image', () => {

        ShopWindowpage.verifyAmountImage();
        ShopWindowpage.uploadStoreImage();
        ShopWindowpage.bottonConfirmUploadImage();
        ShopWindowpage.bottonSaveImage();
        ShopWindowpage.verifyAmountImageAfterUpload();
    });

    it('reorder store images', () => {
        // garante que existem pelo menos 2 imagens
        cy.get('div[draggable="true"]').should('have.length.greaterThan', 1);

        cy.dragAndDrop(
            'div[draggable="true"]:eq(0)', // imagem #1
            'div[draggable="true"]:eq(1)'  // imagem #2
        );
    });


    it('delete store imagem', () => {
        ShopWindowpage.verifyAmountImage();
        ShopWindowpage.mouseOverFirstImage();
        ShopWindowpage.deleteFirstImage();
        ShopWindowpage.verifyAmountImageAfterDelete();
    });

})
