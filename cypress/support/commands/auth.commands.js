/**
 * ========================================
 * COMANDOS DE AUTENTICAÇÃO
 * ========================================
 */

/**
 * Realiza login na aplicação com cache de sessão
 * @param {string} email - Email do usuário
 * @param {string} senha - Senha do usuário
 */
Cypress.Commands.add('login', (email, senha) => {
  cy.session([email, senha], () => {
    cy.visit('/fecomercio-anapolis-demo/login')
    
    // Aguarda a página carregar completamente
    cy.get('input[type="email"]').should('be.visible').type(email)
    cy.get('input[type="password"]').should('be.visible').type(senha)
    cy.get('button[type="submit"]').contains(/entrar|login/i).click()
    
    // Aguarda redirecionamento após login (pode ir para /home ou /lojas)
    cy.url({ timeout: 10000 }).should('not.include', '/login')
    
    // Valida que chegou em uma página válida do projeto
    cy.url().should('match', /fecomercio-anapolis-demo\/(home|lojas)/)
    
    // Aguarda processamento do login
    cy.wait(2000)
    
    // Log de sucesso
    cy.log('✅ Login realizado com sucesso!')
  })
})

/**
 * Realiza logout do sistema
 */
Cypress.Commands.add('logout', () => {
  cy.clearCookies()
  cy.clearLocalStorage()
  cy.log('🚪 Logout realizado')
})