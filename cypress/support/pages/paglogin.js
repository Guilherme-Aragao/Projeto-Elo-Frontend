// Page object para a página de login
class LoginPage {
    // Retorna o elemento do campo de email (id="email")
    fieldEmail(email) {
        cy.get('#email').type(email);
    }
    fieldPassword(password) {
        cy.get('#password').type(password);
    }
    // Valida mensagem HTML5
    alertEmail() {
        cy.get('input[type="email"]').then(($el) => {
            expect($el[0].validity.valid).to.be.false;
        });
    }
}


export default new LoginPage();
