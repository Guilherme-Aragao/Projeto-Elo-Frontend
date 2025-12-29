/**
 * ============================================
 * TESTES E2E - BUSCA DE OFERTAS (HOME)
 * ============================================
 * Feature: Busca de ofertas no header da home
 */

import buscaOfertasPage from '../../support/page-objects/buscaOfertasPage'

describe('Busca de Ofertas (Home)', () => {
  // ============================================
  // DADOS DE TESTE
  // ============================================
  const testData = {
    tenantSlug: 'fecomercio-anapolis-demo',
    buscas: {
      valida: 'desconto',
      curta: 'de',
      caracteresEspeciais: '@#$%',
    },
  }

  // ============================================
  // 1. BUSCA BÁSICA (3 testes)
  // ============================================
  describe('1. Busca Básica', () => {
    beforeEach(() => {
      cy.clearCookies()
      cy.clearLocalStorage()
      cy.visit(`/${testData.tenantSlug}/home`)
      cy.get('body').should('be.visible')
    })

    it('CT-001: deve exibir dropdown de resultados ao digitar no campo de busca', () => {
      // Act
      buscaOfertasPage.buscarEAguardar(testData.buscas.curta)

      // Assert
      buscaOfertasPage.validarDropdownVisivel()
      buscaOfertasPage.validarQuantidadeMinimaResultados(1)
      
      cy.log('CT-001: Dropdown apareceu com resultados')
    })

    it('CT-002: deve filtrar resultados conforme digitação', () => {
      // Act
      buscaOfertasPage.buscarEAguardar(testData.buscas.valida)

      // Assert
      buscaOfertasPage.validarDropdownVisivel()
      buscaOfertasPage.validarQuantidadeMinimaResultados(1)
      buscaOfertasPage.validarResultadoTemTitulo(0)
      buscaOfertasPage.validarResultadoTemImagem(0)
      
      buscaOfertasPage.elements.todosResultados().then(($results) => {
        cy.log(`CT-002: Encontrados ${$results.length} resultados`)
      })
    })

    it('CT-003: deve navegar para página da oferta ao clicar em resultado', () => {
      // Arrange
      buscaOfertasPage.buscarEAguardar(testData.buscas.valida)
      buscaOfertasPage.validarDropdownVisivel()

      // Act
      buscaOfertasPage.clicarResultado(0)
      cy.wait(1000)

      // Assert
      buscaOfertasPage.validarNavegacaoOferta()
      cy.log('CT-003: Navegou para página de detalhes da oferta')
    })
  })

  // ============================================
  // 2. COMPORTAMENTO UX (2 testes)
  // ============================================
  describe('2. Comportamento UX', () => {
    beforeEach(() => {
      cy.clearCookies()
      cy.clearLocalStorage()
      cy.visit(`/${testData.tenantSlug}/home`)
      cy.get('body').should('be.visible')
    })

    it('CT-004: deve limpar busca ao clicar no botão X', () => {
      // Arrange
      buscaOfertasPage.buscarEAguardar(testData.buscas.valida)
      buscaOfertasPage.validarCampoContemTexto(testData.buscas.valida)

      // Act
      buscaOfertasPage.clicarBotaoLimpar()
      cy.wait(500)

      // Assert
      buscaOfertasPage.validarCampoVazio()
      cy.log('CT-004: Campo limpo com sucesso')
    })

    it('CT-005: deve navegar para página de pesquisa ao pressionar Enter', () => {
      // Arrange
      buscaOfertasPage.buscar(testData.buscas.valida)
      buscaOfertasPage.aguardar(400)

      // Act
      buscaOfertasPage.pressionarEnter()
      cy.wait(1000)

      // Assert
      buscaOfertasPage.validarNavegacaoPesquisa()
      cy.url().should('include', `q=${testData.buscas.valida}`)
      cy.log('CT-005: Navegou para página de pesquisa')
    })
  })

  // ============================================
  // 3. PERFORMANCE (1 teste)
  // ============================================
  describe('3. Performance', () => {
    beforeEach(() => {
      cy.clearCookies()
      cy.clearLocalStorage()
      cy.visit(`/${testData.tenantSlug}/home`)
      cy.get('body').should('be.visible')
    })

    it('CT-006: deve fazer debounce corretamente (não buscar a cada letra)', () => {
      // Arrange
      buscaOfertasPage.interceptarBuscaAPI('buscaAPI')

      // Act
      buscaOfertasPage.elements.campoBusca().type('desconto', { delay: 50 })
      cy.wait(500)

      // Assert
      cy.get('@buscaAPI.all').should('have.length.lessThan', 4)
      cy.log('CT-006: Debounce funcionando corretamente')
    })
  })

  // ============================================
  // 4. RESPONSIVIDADE E SEGURANÇA (2 testes)
  // ============================================
  describe('4. Responsividade e Segurança', () => {
    it('CT-007: deve respeitar responsividade mobile', () => {
      // Arrange
      cy.viewport(375, 812)
      cy.visit(`/${testData.tenantSlug}/home`)
      cy.get('body').should('be.visible')

      // Act
      buscaOfertasPage.buscarEAguardar(testData.buscas.valida)

      // Assert
      buscaOfertasPage.validarDropdownVisivel()
      buscaOfertasPage.validarEstruturaResultado(0)
      
      buscaOfertasPage.elements.dropdownResultados()
        .invoke('width')
        .should('be.greaterThan', 300)
        .should('be.lessThan', 400)
      
      cy.log('CT-007: Layout responsivo em mobile')
    })

    it('CT-008: deve tratar corretamente busca com caracteres especiais', () => {
      // Arrange
      cy.clearCookies()
      cy.clearLocalStorage()
      cy.visit(`/${testData.tenantSlug}/home`)
      cy.get('body').should('be.visible')

      // Act
      buscaOfertasPage.buscarEAguardar(testData.buscas.caracteresEspeciais)

      // Assert
      cy.get('body').should('be.visible')
      cy.log('CT-008: Caracteres especiais tratados sem quebrar aplicação')
    })
  })
})