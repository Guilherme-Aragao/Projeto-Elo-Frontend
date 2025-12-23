import OffersPage from "../support/pages/offerspage";

describe('Offers - Elo (clean spec)', () => {
    beforeEach(() => {
        cy.session('lojistaSession', () => {
            cy.loginLojista();
        });
        cy.visit('/ofertas');

    });
    function buildOfferData() {
        const suffix = Date.now().toString().slice(-6); // 6 últimos dígitos só pra não ficar gigante

        return {
            name: `Oferta Cypress ${suffix}`,
            description: `Descrição automática ${suffix}`,
            quantity: 5,
            productCode: `COD-${suffix}`
        };
    }


    it('Create a new offer', () => {
        const offer = buildOfferData();

        OffersPage.bottonNewOffers();
        OffersPage.uploadOfferImage();
        OffersPage.bottonConfirmUploadImage();
        OffersPage.selectFieldNameOffer(offer.name);
        OffersPage.descriptionField(offer.description);
        OffersPage.quantityField(offer.quantity);
        OffersPage.productCodeField(offer.productCode);
        OffersPage.startDateField();   // amanhã 09:00
        OffersPage.endDateField();     // depois de amanhã 18:00
        OffersPage.selectRandomCategory();
        OffersPage.bottonSaveOffer();
        OffersPage.listValidation(offer.name);

    });

    it('Create an offer without filling in a required field', () => {
        const offer = buildOfferData();

        OffersPage.bottonNewOffers();
        OffersPage.uploadOfferImage();
        OffersPage.bottonConfirmUploadImage();
        OffersPage.selectFieldNameOffer(offer.name);
        OffersPage.descriptionField(offer.description);
        OffersPage.startDateField();   // amanhã 09:00
        OffersPage.endDateField();     // depois de amanhã 18:00
        OffersPage.selectRandomCategory();
        OffersPage.bottonSaveOffer();
        OffersPage.requiredFieldError();
    });

    it('Edit an offer', () => {
        const offer = buildOfferData();

        OffersPage.editButton();
        OffersPage.selectFieldNameOffer(offer.name);
        OffersPage.descriptionField(offer.description);
        OffersPage.productCodeField(offer.productCode);
        OffersPage.bottonSaveOffer();
        OffersPage.listValidation(offer.name);
    });

    it('Delete an offer', () => {
        OffersPage.deleteButton();
        OffersPage.confirmDeleteButton();
        OffersPage.deleteValidation();
    });

    it('View details of an offer', () => {
        OffersPage.viewDetailsButton();
        OffersPage.validateOfferDetails();
    });

})