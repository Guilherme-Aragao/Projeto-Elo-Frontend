import ValidateCouponPage from '../support/pages/validarCupompage';

describe('Validar Cupons - Elo (clean spec)', () => {
    beforeEach(() => {
        cy.session('lojistaSession', () => {
            cy.loginLojista();
        });
        cy.visit('/validar-cupom');

    });

    it('Validar cupom com código válido', () => {
        cy.mockCupomValidate();

        ValidateCouponPage.clickTabDigitarCodigo();
        ValidateCouponPage.cuponCodeInput('VbqAB9E')
        ValidateCouponPage.botonVerificarCupom();
        ValidateCouponPage.validateCupomPage('Pastel de Vento Teste');
        ValidateCouponPage.imputPriceCupon('5,00');
        ValidateCouponPage.botonValidarCupom()
        ValidateCouponPage.interceptValidCoupon();
        ValidateCouponPage.couponSuccessfullyValidatedMessage();

    })

    it('Validate coupon with expired code.', () => {
        ValidateCouponPage.clickTabDigitarCodigo();
        ValidateCouponPage.cuponCodeInput('Wv3wqm6')
        ValidateCouponPage.botonVerificarCupom();
        ValidateCouponPage.imputPriceCupon('10,00');
        ValidateCouponPage.botonValidarCupom()
        ValidateCouponPage.couponExpiredMessage();
    })

    it('Cupom not found.', () => {
        ValidateCouponPage.clickTabDigitarCodigo();
        ValidateCouponPage.cuponCodeInput('XXXXXXX')
        ValidateCouponPage.botonVerificarCupom();
        cy.get('li[data-state="open"]', { timeout: 10000 })
            .should('exist')
            .and(($el) => {
                expect($el.text()).to.include('Cupom não encontrado');
            })
    })
})
