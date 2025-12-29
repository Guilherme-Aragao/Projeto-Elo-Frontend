import LoginPage from '../support/pages/paglogin';

describe('Lgin - Elo', () => {
    beforeEach(() => {
        cy.visitLogin()

    })

    it('Login com sucesso', () => {
        LoginPage.fieldEmail('joao.silva@email.com');
        LoginPage.fieldPassword('Senha@123');
        cy.contains('Entrar').click();
        cy.url().should('include', '/home');
    })

    it('Login com email inválido', () => {
        LoginPage.fieldEmail('email.invalido');
        LoginPage.fieldPassword('Senha@123');
        cy.contains('Entrar').click();
        LoginPage.alertEmail();
    })

    it('Login com email inexistente', () => {
        LoginPage.fieldEmail('abcd@email.com.br');
        LoginPage.fieldPassword('Senha@123');
        cy.contains('Entrar').click();
        cy.contains('Email ou senha incorretos').should('be.visible');
    })

    it('Login com senha incorreta', () => {
        LoginPage.fieldEmail('joao.silva@email.com');
        LoginPage.fieldPassword('SenhaErrada@123');
        cy.contains('Entrar').click();
        cy.contains('Email ou senha incorretos').should('be.visible');
    })
})