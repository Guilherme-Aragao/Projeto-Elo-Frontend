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
    alertEmail(message) {
        cy.get('#email').then(($input) => {
            expect($input[0].validationMessage).to.eq(message);
        });
    }
}


export default new LoginPage();
