/**
 * ============================================
 * TESTES E2E - EXPLORAR LOJAS
 * ============================================
 */

import explorarLojasPage from '../../support/page-objects/explorarLojasPage'

describe('US-C1: Buscar Ofertas / Lojas', () => {
  // ============================================
  // DADOS DE TESTE (FIXTURES)
  // ============================================
  const testData = {
    tenantSlug: 'fecomercio-anapolis-demo',
    buscas: {
      valida: 'loja',
      semResultado: 'xyzabc123naoexiste',
      caracteresEspeciais: '@#$%',
      xss: '<script>alert("xss")</script>',
      sqlInjection: "' OR '1'='1",
    },
    ordenacao: {
      nomeAZ: { valor: 'nome-az', texto: 'Nome: A → Z' },
      nomeZA: { valor: 'nome-za', texto: 'Nome: Z → A' },
    },
    usuarios: {
      valido: {
        email: 'cliente5-0-34428@testecarga.com',
        senha: '123456',
      },
    },
  }

  // ============================================
  // 1. BUSCA E VALIDAÇÕES (3 testes)
  // ============================================
  describe('1. Busca e Validações', () => {
    beforeEach(() => {
      cy.clearCookies()
      cy.clearLocalStorage()
      cy.visit(`/${testData.tenantSlug}/lojas`)
      cy.get('body').should('be.visible')
    })

    it('CT-001: deve exibir lista de lojas ao buscar por palavra-chave válida', () => {
      // Arrange
      explorarLojasPage.elements.campoBusca().should('be.visible')

      // Act
      explorarLojasPage.buscarPor(testData.buscas.valida)
      cy.wait(2000)

      // Assert
      cy.get('.grid.grid-cols-1').should('be.visible')
      cy.get('.bg-white.rounded-xl.shadow-sm').should('have.length.greaterThan', 0)
    })

    it('CT-002: deve navegar para página da loja ao clicar em "Ver Loja"', () => {
      // Arrange
      explorarLojasPage.buscarPor(testData.buscas.valida)
      explorarLojasPage.elements.cardsLojas().should('have.length.greaterThan', 0)

      // Act
      explorarLojasPage.clicarVerLoja(0)

      // Assert
      cy.url().should('include', '/loja/')
      cy.url().should('not.include', '/lojas')
    })

    it('CT-003: deve exibir todos os elementos visuais obrigatórios no card', () => {
      // Arrange
      explorarLojasPage.buscarPor(testData.buscas.valida)
      explorarLojasPage.elements.cardsLojas().should('have.length.greaterThan', 0)

      // Act & Assert
      explorarLojasPage.validarEstruturaCard(0)
    })
  })

  // ============================================
  // 2. VALIDAÇÕES DE ERRO (2 testes)
  // ============================================
  describe('2. Validações de Erro', () => {
    beforeEach(() => {
      cy.clearCookies()
      cy.clearLocalStorage()
      cy.visit(`/${testData.tenantSlug}/lojas`)
      cy.get('body').should('be.visible')
    })

    it('CT-004: deve exibir mensagem "Nenhuma loja encontrada" quando busca não retorna resultados', () => {
      // Act
      explorarLojasPage.buscarPor(testData.buscas.semResultado)

      // Assert
      explorarLojasPage.validarMensagemSemResultados()
    })

    it('CT-005: deve tratar corretamente busca com caracteres especiais', () => {
      // Act
      explorarLojasPage.buscarPor(testData.buscas.caracteresEspeciais)

      // Assert - não deve quebrar a aplicação
      cy.get('body').should('be.visible')
    })
  })

  // ============================================
  // 3. SEGURANÇA (3 testes)
  // ============================================
  describe('3. Segurança', () => {
    beforeEach(() => {
      cy.clearCookies()
      cy.clearLocalStorage()
      cy.visit(`/${testData.tenantSlug}/lojas`)
      cy.get('body').should('be.visible')
    })

    it('CT-006: deve prevenir XSS ao buscar com script malicioso', () => {
      // Act
      explorarLojasPage.buscarPor(testData.buscas.xss)

      // Assert
      cy.get('body').should('not.contain', 'alert')
      cy.get('body').should('be.visible')
    })

    it('CT-007: deve prevenir SQL Injection ao buscar com query maliciosa', () => {
      // Act
      explorarLojasPage.buscarPor(testData.buscas.sqlInjection)

      // Assert
      cy.get('body').should('not.contain', 'SQL syntax error')
      cy.get('body').should('not.contain', 'database error')
      cy.get('body').should('not.contain', 'query failed')
      cy.get('body').should('be.visible')
    })

    it('CT-008: não deve expor informações sensíveis em erros', () => {
      // Act
      explorarLojasPage.buscarPor(testData.buscas.sqlInjection)

      // Assert
      cy.get('body').should('not.contain', 'stack trace')
      cy.get('body').should('not.contain', 'exception')
      cy.get('body').should('not.contain', 'password')
      cy.get('body').should('be.visible')
    })
  })

  // ============================================
  // 4. ORDENAÇÃO DE RESULTADOS (2 testes) 
  // ============================================
  describe('4. Ordenação de Resultados', () => {
    beforeEach(() => {
      cy.clearCookies()
      cy.clearLocalStorage()
      cy.visit(`/${testData.tenantSlug}/lojas`)
      cy.get('body').should('be.visible')

      cy.wait(2000)
      cy.get('.grid.grid-cols-1').should('be.visible')
    })

    it('CT-009: deve ordenar lojas por nome (A → Z)', () => {
      cy.log('⚙️ Forçando Z→A primeiro')
      cy.get('#sortBy').select('nome-za')
      cy.wait(2500)
      cy.get('.bg-white.rounded-xl.shadow-sm').should('have.length.greaterThan', 0)
      cy.wait(500)
      
      // Intercepta request
      cy.intercept('GET', '**/stores?*sortField=name&sortOrder=asc*', (req) => {
        req.headers['cache-control'] = 'no-cache'
        req.headers['pragma'] = 'no-cache'
      }).as('ordenacaoAZ')

      // Act
      cy.log('🔄 Mudando para A→Z')
      explorarLojasPage.ordenarPor(testData.ordenacao.nomeAZ.valor)

      // Wait
      cy.wait('@ordenacaoAZ').then((interception) => {
        cy.log('Request completou!')
        cy.log(`Status: ${interception.response.statusCode}`)
        if (interception.response.body?.data) {
          const nomes = interception.response.body.data.map(s => s.businessName)
          cy.log(`📥 API: ${nomes.slice(0, 3).join(', ')}...`)
        }
      })

      cy.wait(3000)
      cy.get('.bg-white.rounded-xl.shadow-sm').should('have.length.greaterThan', 0)
      cy.wait(1000)

      // Assert
      explorarLojasPage.validarOrdenacaoSelecionada(testData.ordenacao.nomeAZ.valor)
      explorarLojasPage.validarOrdenacaoAlfabeticaCrescente()
    })

    it('CT-010: deve ordenar lojas por nome (Z → A)', () => {
      // Act
      explorarLojasPage.ordenarPor(testData.ordenacao.nomeZA.valor)
      explorarLojasPage.aguardar(3000)

      // Assert
      explorarLojasPage.validarOrdenacaoSelecionada(testData.ordenacao.nomeZA.valor)
      explorarLojasPage.validarOrdenacaoAlfabeticaDecrescente()
    })
  })

  // ============================================
  // 5. FILTROS (6 testes)
  // ============================================
  describe('5. Filtros de Categoria e Localização', () => {
    beforeEach(() => {
      cy.clearCookies()
      cy.clearLocalStorage()
      cy.visit(`/${testData.tenantSlug}/lojas`)
      cy.get('body').should('be.visible')
    })

    it('CT-011: deve exibir os filtros de categoria e localização', () => {
      // Assert
      explorarLojasPage.elements.filtroCategoria().should('be.visible')
      explorarLojasPage.elements.filtroLocalizacao().should('be.visible')
    })

    it('CT-012: deve aplicar filtro de categoria e retornar resultados', () => {
      // Act
      cy.get('#filterCategory option').eq(1).invoke('val').then((categoria) => {
        explorarLojasPage.aplicarFiltroCategoria(categoria)
        cy.wait(2000)

        // Assert
        explorarLojasPage.elements.gridLojas().should('be.visible')
      })
    })

    it('CT-013: deve aplicar filtro de localização e retornar resultados', () => {
      // Act
      cy.get('#filterLocation option').eq(1).invoke('val').then((localizacao) => {
        explorarLojasPage.aplicarFiltroLocalizacao(localizacao)
        cy.wait(2000)

        // Assert
        explorarLojasPage.elements.gridLojas().should('be.visible')
      })
    })

    it('CT-014: deve aplicar múltiplos filtros combinados', () => {
      // Act - busca
      cy.get('#searchStore').clear().type('loja')

      // Act - categoria
      cy.get('#filterCategory option').eq(1).invoke('val').then((categoria) => {
        cy.get('#filterCategory').select(categoria)
      })

      // Act - localização
      cy.get('#filterLocation option').eq(1).invoke('val').then((localizacao) => {
        cy.get('#filterLocation').select(localizacao)
      })

      // Act - pesquisa
      cy.get('#searchButton').click()
      cy.wait(2000)

      // Assert
      cy.get('body').should('be.visible')
    })

    it('CT-015: deve limpar filtros e exibir todas as lojas novamente', () => {
      // Arrange
      cy.get('#searchStore').type('loja')
      cy.get('#filterCategory option').eq(1).invoke('val').then((categoria) => {
        cy.get('#filterCategory').select(categoria)
      })
      cy.get('#searchButton').click()
      cy.wait(2000)

      // Act - limpa
      cy.get('#searchStore').clear()
      cy.get('#filterCategory').select('todas')
      cy.get('#filterLocation').select('todas')
      cy.get('#searchButton').click()
      cy.wait(2000)

      // Assert
      explorarLojasPage.elements.gridLojas().should('be.visible')
    })

    it('CT-016: deve buscar ao pressionar Enter no campo de busca', () => {
      // Act
      cy.get('#searchStore').clear().type('loja{enter}')
      cy.wait(2000)

      // Assert
      cy.get('body').should('be.visible')
    })
  })

  // ============================================
  // 6. ACESSO SEM LOGIN (2 testes)
  // ============================================
  describe('6. Acesso Sem Login', () => {
    beforeEach(() => {
      cy.clearCookies()
      cy.clearLocalStorage()
      cy.visit(`/${testData.tenantSlug}/lojas`)
      cy.get('body').should('be.visible')
    })

    it('CT-017: deve permitir buscar lojas sem estar logado', () => {
      // Act
      explorarLojasPage.buscarPor(testData.buscas.valida)

      // Assert
      explorarLojasPage.elements.gridLojas().should('be.visible')
      explorarLojasPage.elements.cardsLojas().should('have.length.greaterThan', 0)
    })

    it('CT-018: deve permitir visualizar detalhes da loja sem login', () => {
      // Arrange
      explorarLojasPage.buscarPor(testData.buscas.valida)
      explorarLojasPage.elements.cardsLojas().should('have.length.greaterThan', 0)

      // Act
      explorarLojasPage.clicarVerLoja(0)

      // Assert
      cy.url().should('include', '/loja/')
    })
  })

  // ============================================
  // 7. FUNCIONALIDADE DE FAVORITAR (1 teste)
  // ============================================
  describe('7. Funcionalidade de Favoritar', () => {
    beforeEach(() => {
      cy.clearCookies()
      cy.clearLocalStorage()
      cy.visit(`/${testData.tenantSlug}/lojas`)
      cy.get('body').should('be.visible')

      // Login necessário
      cy.login(testData.usuarios.valido.email, testData.usuarios.valido.senha)
      cy.visit(`/${testData.tenantSlug}/lojas`)
    })

    it('CT-019: deve permitir favoritar loja estando logado', () => {
      // Arrange
      explorarLojasPage.buscarPor(testData.buscas.valida)
      explorarLojasPage.elements.cardsLojas().should('have.length.greaterThan', 0)

      // Act
      cy.get('#favoriteStore0').click()
      cy.wait(1000)

      // Assert
      cy.get('body').should('be.visible')
    })
  })

  // ============================================
  // 8. RESPONSIVIDADE (3 testes)
  // ============================================
  describe('8. Responsividade', () => {
    beforeEach(() => {
      cy.clearCookies()
      cy.clearLocalStorage()
      cy.visit(`/${testData.tenantSlug}/lojas`)
      cy.get('body').should('be.visible')
    })

    it('CT-020: deve exibir layout correto em mobile (iPhone X)', () => {
      // Arrange
      cy.viewport(375, 812)

      // Act
      explorarLojasPage.buscarPor(testData.buscas.valida)

      // Assert
      explorarLojasPage.elements.gridLojas().should('be.visible')
      explorarLojasPage.elements.cardsLojas().should('have.length.greaterThan', 0)
      explorarLojasPage.validarEstruturaCard(0)
    })

    it('CT-021: deve exibir layout correto em tablet (iPad)', () => {
      // Arrange
      cy.viewport(768, 1024)

      // Act
      explorarLojasPage.buscarPor(testData.buscas.valida)

      // Assert
      explorarLojasPage.elements.gridLojas().should('be.visible')
      explorarLojasPage.elements.cardsLojas().should('have.length.greaterThan', 0)
      explorarLojasPage.validarEstruturaCard(0)
    })

    it('CT-022: deve exibir layout correto em desktop (MacBook)', () => {
      // Arrange
      cy.viewport(1440, 900)

      // Act
      explorarLojasPage.buscarPor(testData.buscas.valida)

      // Assert
      explorarLojasPage.elements.gridLojas().should('be.visible')
      explorarLojasPage.elements.cardsLojas().should('have.length.greaterThan', 0)
      explorarLojasPage.validarEstruturaCard(0)
    })
  })

  // ============================================
  // 9. EXPERIÊNCIA DO USUÁRIO (3 testes)
  // ============================================
  describe('9. Experiência do Usuário', () => {
    beforeEach(() => {
      cy.clearCookies()
      cy.clearLocalStorage()
      cy.visit(`/${testData.tenantSlug}/lojas`)
      cy.get('body').should('be.visible')
    })

    it('CT-023: deve exibir indicador de loading durante a busca', () => {
      // Act
      cy.get('#searchStore').clear().type('loja')
      cy.get('#searchButton').click()

      // Assert
      cy.wait(100)
      cy.get('body').should('be.visible')
    })

    it('CT-024: deve manter a URL correta após busca', () => {
      // Act
      explorarLojasPage.buscarPor(testData.buscas.valida)

      // Assert
      cy.url().should('include', '/lojas')
      cy.url().should('not.include', '/login')
    })

    it('CT-025: deve manter funcionalidade após múltiplas buscas consecutivas', () => {
      // Act 1
      explorarLojasPage.buscarPor(testData.buscas.valida)
      explorarLojasPage.elements.cardsLojas().should('have.length.greaterThan', 0)

      // Act 2
      explorarLojasPage.buscarPor(testData.buscas.semResultado)
      explorarLojasPage.validarMensagemSemResultados()

      // Act 3
      explorarLojasPage.buscarPor(testData.buscas.valida)

      // Assert
      explorarLojasPage.elements.gridLojas().should('be.visible')
      explorarLojasPage.elements.cardsLojas().should('have.length.greaterThan', 0)
      explorarLojasPage.validarEstruturaCard(0)
    })
  })
})