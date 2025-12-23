/**
 * ========================================
 * COMANDOS UTILITÁRIOS
 * ========================================
 */

/**
 * Valida que o header está presente e visível
 */
Cypress.Commands.add('validarHeader', () => {
  cy.get('header').should('be.visible')
})

/**
 * Valida que o footer está presente
 */
Cypress.Commands.add('validarFooter', () => {
  cy.get('footer').should('exist').scrollIntoView().should('be.visible')
})

/**
 * Aguarda loading desaparecer
 * @param {number} timeout - Timeout em ms (padrão: 15000)
 */
Cypress.Commands.add('aguardarLoading', (timeout = 15000) => {
  cy.get('.animate-spin', { timeout }).should('not.exist')
})

/**
 * Valida URL atual
 * @param {string} path - Caminho esperado
 */
Cypress.Commands.add('validarURL', (path) => {
  cy.url().should('include', path)
})

/**
 * Tira screenshot com timestamp
 * @param {string} nome - Nome base do screenshot
 */
Cypress.Commands.add('screenshotCustom', (nome) => {
  const timestamp = new Date().getTime()
  cy.screenshot(`${nome}-${timestamp}`)
})

/**
 * Valida layout em diferentes viewports
 * @param {string} device - 'mobile', 'tablet' ou 'desktop'
 */
Cypress.Commands.add('validarLayoutResponsivo', (device) => {
  const viewports = {
    mobile: [375, 667],
    tablet: [768, 1024],
    desktop: [1920, 1080]
  }
  
  const [width, height] = viewports[device]
  cy.viewport(width, height)
})

/**
 * Valida que botões têm títulos ou aria-labels
 */
Cypress.Commands.add('validarAcessibilidadeBotoes', () => {
  cy.get('button').each(($btn) => {
    cy.wrap($btn).should('satisfy', ($el) => {
      return $el.attr('title') || $el.attr('aria-label') || $el.text().trim().length > 0
    })
  })
})

/**
 * Valida que imagens têm atributo alt
 */
Cypress.Commands.add('validarAcessibilidadeImagens', () => {
  cy.get('img').each(($img) => {
    cy.wrap($img).should('have.attr', 'alt')
  })
})

/**
 * Valida performance de carregamento da página
 * @param {number} tempoMaximo - Tempo máximo em ms (padrão: 3000)
 */
Cypress.Commands.add('validarPerformance', (tempoMaximo = 3000) => {
  cy.window().then((win) => {
    const performance = win.performance
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart
    expect(loadTime).to.be.lessThan(tempoMaximo)
  })
})