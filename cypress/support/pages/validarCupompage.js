
class ValidateCouponPage {

    visit() {
        cy.visit('/validar-cupom');
    }


    clickTabDigitarCodigo() {
        cy.contains('button', 'Digitar Código').click();
    }

    cuponCodeInput(codigo) {
        cy.contains('label', 'Código do Cupom')
            .parent()
            .find('input')
            .type(codigo);
    }

    botonVerificarCupom() {
        cy.contains('button', 'Verificar Cupom').click();
    }

    validateCupomPage(nameCupom) {
        cy.contains('Detalhes da Oferta').should('be.visible');
        cy.contains(nameCupom).should('be.visible');
    }

    imputPriceCupon(price) {
        cy.contains('label', 'Valor da Compra')
            .parent()
            .find('input')
            .type(price);
    }
    botonValidarCupom() {
        cy.contains('button', 'Validar Cupom').click();

    }

    interceptValidCoupon() {
        cy.wait('@postValidar');
    }

    couponSuccessfullyValidatedMessage() {
        cy.contains('Cupom validado com sucesso').should('exist');
    }

    couponExpiredMessage() {
        cy.get('li[data-state="open"]', { timeout: 10000 })
            .should('exist')
            .and(($el) => {
                expect($el.text()).to.include('Este cupom expirou');
            });
    }


}

export default new ValidateCouponPage();