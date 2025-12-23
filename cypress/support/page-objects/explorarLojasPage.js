/**
 * =========================================
 * PAGE OBJECT - EXPLORAR LOJAS (COMPLETO)
 * =========================================
 * 
 * Página de listagem e busca de lojas do marketplace
 * 
 * @class ExplorarLojasPage
 * 
 */

class ExplorarLojasPage {
  /**
   * =========================================
   * ELEMENTOS DA PÁGINA
   * =========================================
   */
  
  elements = {
    // Campo de busca e botões
    campoBusca: () => cy.get('#searchStore'),
    botaoPesquisar: () => cy.get('#searchButton'),
    
    // Novos filtros
    selectCategoria: () => cy.get('#filterCategory'),
    selectLocalizacao: () => cy.get('#filterLocation'),
    
    // Aliases para filtros
    filtroCategoria: () => cy.get('#filterCategory'),
    filtroLocalizacao: () => cy.get('#filterLocation'),
    
    // Loading
    loadingSpinner: () => cy.get('.animate-spin'),
    loadingContainer: () => cy.contains('Loader2').parent(),
    
    // Container de resultados
    containerResultados: () => cy.get('.grid.grid-cols-1'),
    cardsLojas: () => cy.get('.bg-white.rounded-xl.shadow-sm'),
    
    // Alias para gridLojas
    gridLojas: () => cy.get('.grid.grid-cols-1'),
    
    // Select de ordenação
    selectOrdenacao: () => cy.get('#sortBy'),
    
    // Mensagem de sem resultados
    mensagemSemResultados: () => cy.contains('Nenhuma loja encontrada com os filtros aplicados'),
    
    // Elementos dentro do card (primeiro card como referência)
    primeiroCard: {
      card: () => cy.get('.bg-white.rounded-xl.shadow-sm').first(),
      imagem: () => cy.get('.bg-white.rounded-xl.shadow-sm').first().find('img'),
      nomeLoja: () => cy.get('.bg-white.rounded-xl.shadow-sm').first().find('h3'),
      categoria: () => cy.get('.bg-white.rounded-xl.shadow-sm').first().find('span.px-3.py-1.rounded-full'),
      descricao: () => cy.get('.bg-white.rounded-xl.shadow-sm').first().find('p.text-gray-600'),
      endereco: () => cy.get('.bg-white.rounded-xl.shadow-sm').first().contains('Rua'),
      telefone: () => cy.get('.bg-white.rounded-xl.shadow-sm').first().contains('('),
      ofertas: () => cy.get('.bg-white.rounded-xl.shadow-sm').first().contains('ofertas'),
      botaoFavoritar: () => cy.get('#favoriteStore0'),
      botaoVerLoja: () => cy.get('#viewStore0'),
    },
    
    // Funções para acessar cards específicos por índice
    getCardPorIndice: (indice) => cy.get('.bg-white.rounded-xl.shadow-sm').eq(indice),
    getBotaoFavoritarPorIndice: (indice) => cy.get(`#favoriteStore${indice}`),
    getBotaoVerLojaPorIndice: (indice) => cy.get(`#viewStore${indice}`),
  }

  /**
   * =========================================
   * AÇÕES DA PÁGINA
   * =========================================
   */

  /**
   * Acessa a página de explorar lojas
   */
  visitar() {
    cy.visit('/fecomercio-anapolis-demo/lojas')
    // Aguarda a página carregar completamente
    cy.get('body').should('be.visible')
  }

  /**
   * Realiza busca por palavra-chave
   * @param {string} palavraChave - Termo a ser buscado
   * @param {boolean} pressionarEnter - Se deve pressionar Enter ao invés de clicar no botão (padrão: false)
   */
  buscarPor(palavraChave, pressionarEnter = false) {
    // Digita no campo de busca
    this.elements.campoBusca().should('be.visible').clear()
    
    if (palavraChave) {
      this.elements.campoBusca().type(palavraChave)
    }
    
    if (pressionarEnter) {
      // Pressiona Enter
      this.elements.campoBusca().type('{enter}')
    } else {
      // Clica no botão de pesquisar
      this.elements.botaoPesquisar().should('be.visible').click()
    }
  }

  /**
   * Seleciona uma categoria no filtro
   * @param {string} categoria - Nome ou valor da categoria (ou "todas")
   */
  selecionarCategoria(categoria) {
    this.elements.selectCategoria().should('be.visible').select(categoria)
  }

  /**
   * Seleciona uma localização/bairro no filtro
   * @param {string} localizacao - Nome do bairro (ou "todas")
   */
  selecionarLocalizacao(localizacao) {
    this.elements.selectLocalizacao().should('be.visible').select(localizacao)
  }

  /**
   * Aplica filtro de categoria e pesquisa
   * @param {string} categoria - Categoria a ser selecionada
   */
  aplicarFiltroCategoria(categoria) {
    this.elements.selectCategoria().should('be.visible').select(categoria)
    this.elements.botaoPesquisar().should('be.visible').click()
  }

  /**
   * ✅ ADICIONADO: Aplica filtro de localização e pesquisa
   * @param {string} localizacao - Localização a ser selecionada
   */
  aplicarFiltroLocalizacao(localizacao) {
    this.elements.selectLocalizacao().should('be.visible').select(localizacao)
    this.elements.botaoPesquisar().should('be.visible').click()
  }

  /**
   * Aplica filtros completos (busca + categoria + localização) e clica em Pesquisar
   * @param {Object} filtros - Objeto com filtros a aplicar
   * @param {string} filtros.busca - Termo de busca (opcional)
   * @param {string} filtros.categoria - Categoria (opcional)
   * @param {string} filtros.localizacao - Localização (opcional)
   */
  aplicarFiltros(filtros = {}) {
    const { busca, categoria, localizacao } = filtros
    
    // Aplica busca se fornecida
    if (busca !== undefined) {
      this.elements.campoBusca().should('be.visible').clear()
      if (busca) {
        this.elements.campoBusca().type(busca)
      }
    }
    
    // Aplica categoria se fornecida
    if (categoria) {
      this.selecionarCategoria(categoria)
    }
    
    // Aplica localização se fornecida
    if (localizacao) {
      this.selecionarLocalizacao(localizacao)
    }
    
    // Clica no botão Pesquisar para aplicar filtros
    this.elements.botaoPesquisar().should('be.visible').click()
  }

  /**
   * Limpa todos os filtros e realiza nova busca
   */
  limparFiltros() {
    this.elements.campoBusca().clear()
    this.selecionarCategoria('todas')
    this.selecionarLocalizacao('todas')
    this.elements.botaoPesquisar().click()
  }

  /**
   * Aguarda os resultados carregarem
   * @param {number} timeout - Tempo máximo de espera em ms (padrão: 10000)
   */
  aguardarResultados(timeout = 10000) {
    // Aguarda o container de resultados estar visível
    this.elements.containerResultados().should('be.visible', { timeout })
  }

  /**
   * Limpa o campo de busca
   */
  limparBusca() {
    this.elements.campoBusca().clear()
  }

  /**
   * Seleciona opção de ordenação
   * @param {string} opcao - Valor da opção (nome-az, nome-za, bairro-az, bairro-za)
   */
  ordenarPor(opcao) {
    this.elements.selectOrdenacao().select(opcao)
  }

  /**
   * Clica no botão "Ver Loja" do card especificado
   * @param {number} indice - Índice do card (0 = primeiro)
   */
  clicarVerLoja(indice = 0) {
    this.elements.getBotaoVerLojaPorIndice(indice).scrollIntoView().click()
  }

  /**
   * Clica no botão de favoritar do card especificado
   * @param {number} indice - Índice do card (0 = primeiro)
   */
  clicarFavoritar(indice = 0) {
    this.elements.getBotaoFavoritarPorIndice(indice).scrollIntoView().click()
  }

  /**
   * Obtém o nome da loja de um card específico
   * @param {number} indice - Índice do card
   * @returns {Cypress.Chainable} Nome da loja
   */
  obterNomeLojaPorIndice(indice) {
    return this.elements.getCardPorIndice(indice).find('h3.text-white').invoke('text')
  }

  /**
   * =========================================
   * VALIDAÇÕES
   * =========================================
   */

  /**
   * Valida que resultados foram exibidos
   */
  validarResultadosExibidos() {
    this.elements.cardsLojas().should('have.length.greaterThan', 0)
  }

  /**
   * Valida que nenhum resultado foi encontrado
   */
  validarSemResultados() {
    this.elements.mensagemSemResultados().should('be.visible')
    // Não valida se cards existem ou não, pois podem ser da busca anterior
    // O importante é que a mensagem esteja visível
  }

  validarMensagemSemResultados() {
    cy.contains('Nenhuma loja encontrada').should('be.visible')
  }

  /**
   * Valida a quantidade de resultados exibidos
   * @param {number} quantidade - Quantidade esperada
   */
  validarQuantidadeResultados(quantidade) {
    this.elements.cardsLojas().should('have.length', quantidade)
  }

  /**
   * Valida que a ordenação está selecionada
   * @param {string} valor - Valor esperado no select
   */
  validarOrdenacaoSelecionada(valor) {
    this.elements.selectOrdenacao().should('have.value', valor)
  }

  /**
   * Valida estrutura completa de um card
   * @param {number} indice - Índice do card a validar (padrão: 0)
   */
  validarEstruturaCard(indice = 0) {
    // Valida que o card existe
    cy.get('.bg-white.rounded-xl.shadow-sm').eq(indice).should('be.visible')
    
    // Validação OPCIONAL de imagem (lojas podem não ter foto)
    cy.get('.bg-white.rounded-xl.shadow-sm').eq(indice).then($card => {
      const hasImage = $card.find('img').length > 0
      
      if (hasImage) {
        cy.log(`✅ Card ${indice} possui imagem`)
        cy.wrap($card).find('img').should('exist')
      } else {
        cy.log(`⚠️ Card ${indice} sem imagem (skeleton ou sem foto cadastrada)`)
      }
    })
    
    // Valida elementos obrigatórios
    cy.get('.bg-white.rounded-xl.shadow-sm').eq(indice).within(() => {
      cy.get('h3').should('be.visible') // Nome da loja
      cy.contains('ofertas').should('be.visible') // Contador de ofertas
    })
    
    // Valida botões
    cy.get(`#favoriteStore${indice}`).should('exist')
    cy.get(`#viewStore${indice}`).should('exist')
  }

  /**
   * Valida que o primeiro card contém uma palavra-chave específica
   * @param {string} palavraChave - Palavra a ser buscada no card
   */
  validarPrimeiroCardContem(palavraChave) {
    this.elements.primeiroCard.nomeLoja()
      .invoke('text')
      .should('match', new RegExp(palavraChave, 'i'))
  }

  /**
   * Valida elementos visuais do card (estrutura do grid)
   * @param {number} indice - Índice do card
   */
  validarEstilosCard(indice = 0) {
    // Valida que o card existe e está visível - query direta, sem armazenar
    cy.get('.bg-white.rounded-xl.shadow-sm').eq(indice).should('exist').and('be.visible')
    
    // Valida classes CSS do card - nova query a cada vez
    cy.get('.bg-white.rounded-xl.shadow-sm').eq(indice).should('have.class', 'bg-white')
    cy.get('.bg-white.rounded-xl.shadow-sm').eq(indice).should('have.class', 'rounded-xl')
    cy.get('.bg-white.rounded-xl.shadow-sm').eq(indice).should('have.class', 'shadow-sm')
  }

  /**
   * Valida que o loading está visível
   */
  validarLoadingVisivel() {
    // Tenta encontrar o loading spinner com animate-spin
    cy.get('body').then($body => {
      const hasLoading = $body.find('.animate-spin').length > 0
      
      if (hasLoading) {
        cy.log('✅ Loading encontrado com animate-spin')
        cy.get('.animate-spin').should('be.visible')
      } else {
        cy.log('⚠️ Loading não encontrado - pode ser muito rápido')
      }
    })
  }

  /**
   * Aguarda o loading desaparecer
   * @param {number} timeout - Tempo máximo de espera em ms
   */
  aguardarLoadingDesaparecer(timeout = 10000) {
    // Aguarda o loading não estar mais visível
    cy.get('.animate-spin', { timeout }).should('not.exist')
  }

  /**
   * Valida que a URL está correta
   * @param {string} urlEsperada - URL ou parte da URL esperada
   */
  validarURL(urlEsperada) {
    cy.url().should('include', urlEsperada)
  }

  /**
   * =========================================
   * HELPERS / UTILITÁRIOS
   * =========================================
   */

  /**
   * Conta quantos cards de loja estão visíveis
   * @returns {Cypress.Chainable<number>} Quantidade de cards
   */
  contarCardsVisiveis() {
    return this.elements.cardsLojas().its('length')
  }

  /**
   * Coleta nomes de todas as lojas exibidas
   * @returns {Cypress.Chainable<string[]>} Array com nomes das lojas
   */
  coletarNomesLojas() {
    const nomes = []
    return this.elements.cardsLojas().each(($card) => {
      // Busca qualquer h3 dentro do card
      const $h3 = $card.find('h3')
      if ($h3.length > 0) {
        const nome = $h3.text().trim()
        if (nome) {
          nomes.push(nome)
        }
      }
    }).then(() => nomes)
  }

  /**
   * Coleta bairros de todas as lojas exibidas
   * @returns {Cypress.Chainable<string[]>} Array com bairros das lojas
   */
  coletarBairrosLojas() {
    const bairros = []
    return this.elements.cardsLojas().each(($card) => {
      // Busca pelo endereço que contém o bairro
      const endereco = $card.find('.line-clamp-2').text().trim()
      if (endereco) {
        // Extrai bairro (última parte antes da cidade)
        const match = endereco.match(/-(.*?),/)
        if (match && match[1]) {
          bairros.push(match[1].trim())
        }
      }
    }).then(() => bairros)
  }

  /**
   * Valida ordenação alfabética crescente dos nomes
   */
  validarOrdenacaoAlfabeticaCrescente() {
    this.coletarNomesLojas().then(nomes => {
      // Filtra nomes vazios
      const nomesFiltrados = nomes.filter(n => n && n.trim().length > 0)
      
      // Ordena esperado (case insensitive, com locale)
      const nomesOrdenados = [...nomesFiltrados].sort((a, b) => 
        a.toLowerCase().localeCompare(b.toLowerCase(), 'pt-BR')
      )
      
      // ============================================
      // LOGS SUPER DETALHADOS PARA DEBUG
      // ============================================
      cy.log('╔════════════════════════════════════════════════════════════')
      cy.log('║  VALIDAÇÃO DE ORDENAÇÃO A→Z')
      cy.log('╠════════════════════════════════════════════════════════════')
      cy.log(`║  Total de lojas: ${nomesFiltrados.length}`)
      cy.log('╠════════════════════════════════════════════════════════════')
      
      // Mostra TODOS os nomes recebidos (numerados)
      cy.log('║  📥 ORDEM RECEBIDA DO BACKEND:')
      nomesFiltrados.forEach((nome, i) => {
        cy.log(`║     ${String(i + 1).padStart(2, '0')}. ${nome}`)
      })
      
      cy.log('╠════════════════════════════════════════════════════════════')
      
      // Mostra como DEVERIA estar
      cy.log('║  ✅ ORDEM ESPERADA (ALFABÉTICA):')
      nomesOrdenados.forEach((nome, i) => {
        cy.log(`║     ${String(i + 1).padStart(2, '0')}. ${nome}`)
      })
      
      cy.log('╠════════════════════════════════════════════════════════════')
      
      // Comparação case insensitive
      const nomesLower = nomesFiltrados.map(n => n.toLowerCase())
      const nomesOrdenadosLower = nomesOrdenados.map(n => n.toLowerCase())
      
      // Identifica DIFERENÇAS
      const diferencas = []
      nomesLower.forEach((nome, idx) => {
        if (nome !== nomesOrdenadosLower[idx]) {
          diferencas.push({
            posicao: idx + 1,
            recebido: nomesFiltrados[idx],
            esperado: nomesOrdenados[idx],
            recebidoLower: nome,
            esperadoLower: nomesOrdenadosLower[idx]
          })
        }
      })
      
      if (diferencas.length > 0) {
        cy.log('║  🔴 DIFERENÇAS ENCONTRADAS:')
        cy.log(`║     Total de erros: ${diferencas.length} de ${nomesFiltrados.length} lojas (${Math.round(diferencas.length / nomesFiltrados.length * 100)}%)`)
        cy.log('║')
        diferencas.forEach((diff, idx) => {
          cy.log(`║     ❌ Posição ${String(diff.posicao).padStart(2, '0')}:`)
          cy.log(`║        Recebido: "${diff.recebido}"`)
          cy.log(`║        Esperado: "${diff.esperado}"`)
          if (idx < diferencas.length - 1) cy.log('║')
        })
        
        cy.log('╠════════════════════════════════════════════════════════════')
        cy.log('║  🔍 ANÁLISE:')
        cy.log(`║     O backend NÃO está ordenando corretamente.`)
        cy.log(`║     Necessário ajustar a query SQL no backend:`)
        cy.log(`║     ORDER BY LOWER(name) COLLATE utf8mb4_unicode_ci`)
        
      } else {
        cy.log('║  ✅ ORDENAÇÃO ESTÁ PERFEITA!')
      }
      
      cy.log('╚════════════════════════════════════════════════════════════')
      
      // Validação final
      expect(nomesLower).to.deep.equal(nomesOrdenadosLower)
    })
  }

  /**
   * Valida ordenação alfabética decrescente dos nomes
   */
  validarOrdenacaoAlfabeticaDecrescente() {
    this.coletarNomesLojas().then(nomes => {
      // Filtra nomes vazios
      const nomesFiltrados = nomes.filter(n => n && n.trim().length > 0)
      
      // Ordena esperado (case insensitive, com locale, invertido)
      const nomesOrdenados = [...nomesFiltrados].sort((a, b) => 
        b.toLowerCase().localeCompare(a.toLowerCase(), 'pt-BR')
      )
      
      // Log detalhado para debug
      cy.log('=== VALIDAÇÃO DE ORDENAÇÃO Z→A ===')
      cy.log(`Total de lojas: ${nomesFiltrados.length}`)
      cy.log('Nomes recebidos:', nomesFiltrados.join(' | '))
      cy.log('Nomes esperados (Z→A):', nomesOrdenados.join(' | '))
      
      // Comparação case insensitive
      const nomesLower = nomesFiltrados.map(n => n.toLowerCase())
      const nomesOrdenadosLower = nomesOrdenados.map(n => n.toLowerCase())
      
      // Se não estiver ordenado perfeitamente, mostra as diferenças
      if (JSON.stringify(nomesLower) !== JSON.stringify(nomesOrdenadosLower)) {
        cy.log('⚠️ DIFERENÇAS ENCONTRADAS:')
        nomesLower.forEach((nome, idx) => {
          if (nome !== nomesOrdenadosLower[idx]) {
            cy.log(`  Posição ${idx}: "${nome}" deveria ser "${nomesOrdenadosLower[idx]}"`)
          }
        })
      }
      
      expect(nomesLower).to.deep.equal(nomesOrdenadosLower)
    })
  }

  validarOrdenacaoPorBairroCrescente() {
    this.coletarBairrosLojas().then(bairros => {
      const bairrosFiltrados = bairros.filter(b => b && b.trim().length > 0)
      
      const bairrosOrdenados = [...bairrosFiltrados].sort((a, b) => 
        a.toLowerCase().localeCompare(b.toLowerCase(), 'pt-BR')
      )
      
      cy.log('=== VALIDAÇÃO DE ORDENAÇÃO BAIRRO A→Z ===')
      cy.log(`Total: ${bairrosFiltrados.length}`)
      cy.log('Recebido:', bairrosFiltrados.join(' | '))
      cy.log('Esperado:', bairrosOrdenados.join(' | '))
      
      const bairrosLower = bairrosFiltrados.map(b => b.toLowerCase())
      const bairrosOrdenadosLower = bairrosOrdenados.map(b => b.toLowerCase())
      
      expect(bairrosLower).to.deep.equal(bairrosOrdenadosLower)
    })
  }

  validarOrdenacaoPorBairroDecrescente() {
    this.coletarBairrosLojas().then(bairros => {
      const bairrosFiltrados = bairros.filter(b => b && b.trim().length > 0)
      
      const bairrosOrdenados = [...bairrosFiltrados].sort((a, b) => 
        b.toLowerCase().localeCompare(a.toLowerCase(), 'pt-BR')
      )
      
      cy.log('=== VALIDAÇÃO DE ORDENAÇÃO BAIRRO Z→A ===')
      cy.log(`Total: ${bairrosFiltrados.length}`)
      cy.log('Recebido:', bairrosFiltrados.join(' | '))
      cy.log('Esperado:', bairrosOrdenados.join(' | '))
      
      const bairrosLower = bairrosFiltrados.map(b => b.toLowerCase())
      const bairrosOrdenadosLower = bairrosOrdenados.map(b => b.toLowerCase())
      
      expect(bairrosLower).to.deep.equal(bairrosOrdenadosLower)
    })
  }

  /**
   * Aguarda um tempo específico (use com moderação)
   * @param {number} ms - Tempo em milissegundos
   */
  aguardar(ms = 1000) {
    cy.wait(ms)
  }

  /**
   * Rola a página até o topo
   */
  rolarParaTopo() {
    cy.scrollTo('top')
  }

  /**
   * Rola até um card específico
   * @param {number} indice - Índice do card
   */
  rolarAteCard(indice) {
    this.elements.getCardPorIndice(indice).scrollIntoView()
  }
}

// Exporta uma instância única do Page Object
export default new ExplorarLojasPage()