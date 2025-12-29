/**
 * ========================================
 * COMANDOS PARA FAVORITOS (OFERTAS + LOJAS)
 * ========================================
 */

// ========================================
// COMANDOS GERAIS DE FAVORITOS
// ========================================

/**
 * Acessa a página de favoritos
 */
Cypress.Commands.add('acessarFavoritos', () => {
  cy.visit('/favoritos')
  cy.contains('Meus Favoritos', { timeout: 10000 }).should('be.visible')
})

/**
 * Valida estado vazio de favoritos (sem ofertas)
 */
Cypress.Commands.add('validarFavoritosVazio', () => {
  cy.contains('Nenhuma oferta favorita').should('be.visible')
  cy.contains('Adicione ofertas aos favoritos para vê-las aqui').should('be.visible')
  cy.contains('a', 'Explorar Ofertas').should('be.visible')
})

/**
 * Valida estado vazio de lojas favoritas
 */
Cypress.Commands.add('validarLojasFavoritasVazio', () => {
  cy.contains('Nenhuma loja favorita').should('be.visible')
  cy.contains('Adicione lojas aos favoritos para vê-las aqui').should('be.visible')
  cy.contains('a', 'Explorar Lojas').should('be.visible')
})

/**
 * Valida seção "Ofertas Favoritas"
 */
Cypress.Commands.add('validarSecaoOfertasFavoritas', () => {
  cy.contains('Ofertas Favoritas').should('be.visible')
  cy.contains('Produtos que você marcou como favoritos').should('be.visible')
})

/**
 * Valida seção "Lojas Favoritas"
 */
Cypress.Commands.add('validarSecaoLojasFavoritas', () => {
  cy.contains('Lojas Favoritas').should('be.visible')
  cy.contains('Estabelecimentos que você marcou como favoritos').should('be.visible')
})

/**
 * Valida links "Explorar"
 */
Cypress.Commands.add('validarLinksExplorar', () => {
  cy.contains('a', 'Explorar Ofertas').should('be.visible').and('have.attr', 'href')
  cy.contains('a', 'Explorar Lojas').should('be.visible').and('have.attr', 'href')
})

/**
 * Clica no link "Explorar Ofertas"
 */
Cypress.Commands.add('clicarExplorarOfertas', () => {
  cy.contains('a', 'Explorar Ofertas').click()
  cy.url().should('include', '/home')
})

/**
 * Clica no link "Explorar Lojas"
 */
Cypress.Commands.add('clicarExplorarLojas', () => {
  cy.contains('a', 'Explorar Lojas').click()
  cy.url().should('match', /lojas/)
})

/**
 * Valida ícone de estado vazio
 * @param {string} tipo - 'oferta' ou 'loja'
 */
Cypress.Commands.add('validarIconeVazio', (tipo = 'oferta') => {
  if (tipo === 'oferta') {
    cy.contains('Nenhuma oferta favorita').parent().find('svg').should('exist')
  } else {
    cy.contains('Nenhuma loja favorita').parent().find('svg').should('exist')
  }
})

/**
 * Valida estilo dos links Explorar
 */
Cypress.Commands.add('validarEstiloLinksExplorar', () => {
  cy.contains('a', 'Explorar Ofertas').should(($link) => {
    const bgColor = $link.css('background-color')
    const color = $link.css('color')
    expect(bgColor).to.equal('rgb(217, 206, 50)')
    expect(color).to.equal('rgb(13, 12, 0)')
  })
  
  cy.contains('a', 'Explorar Lojas').should(($link) => {
    const bgColor = $link.css('background-color')
    const color = $link.css('color')
    expect(bgColor).to.equal('rgb(217, 206, 50)')
    expect(color).to.equal('rgb(13, 12, 0)')
  })
})

// ========================================
// FAVORITOS DE OFERTAS
// ========================================

/**
 * Encontra botões de favorito nos cards de ofertas (DIVs com right-2 top-2)
 */
Cypress.Commands.add('encontrarBotoesFavorito', () => {
  cy.scrollTo('bottom', { duration: 1000 })
  cy.wait(500)
  cy.scrollTo('top', { duration: 1000 })
  cy.wait(500)
  
  return cy.get('div.absolute.right-2.top-2.rounded-full.cursor-pointer').filter((i, div) => {
    const $div = Cypress.$(div)
    const temHeartIcon = $div.find('svg.lucide-heart').length > 0
    const classes = $div.attr('class') || ''
    const temClasses = classes.includes('backdrop-blur-sm') && 
                      classes.includes('z-10') && 
                      classes.includes('p-1.5')
    return temHeartIcon && temClasses
  }).then(($botoesFiltrados) => {
    return cy.wrap($botoesFiltrados)
  })
})

/**
 * Adiciona uma oferta aos favoritos pela HOME
 * @param {number} index - Índice da oferta (0 = primeira)
 */
Cypress.Commands.add('adicionarOfertaAosFavoritos', (index = 0) => {
  cy.visit('/home')
  cy.wait(3000)
  
  cy.get('div[class*="rounded-xl"]').should('have.length.greaterThan', 0)
  
  cy.scrollTo('bottom', { duration: 1000 })
  cy.wait(500)
  cy.scrollTo('top', { duration: 1000 })
  cy.wait(500)
  
  cy.encontrarBotoesFavorito().then(($botoes) => {
    if ($botoes.length > index) {
      const $btn = $botoes.eq(index)
      cy.wrap($btn).scrollIntoView({ duration: 500 })
      cy.wait(500)
      
      const svg = $btn.find('svg.lucide-heart')
      const fill = svg.attr('fill')
      
      if (fill === 'none' || !fill) {
        cy.wrap($btn).click({ force: true })
        cy.contains('Adicionado aos favoritos', { timeout: 5000 }).should('be.visible')
        cy.wait(2000)
      }
    }
  })
})

/**
 * Remove oferta dos favoritos
 * @param {number} index - Índice da oferta
 */
Cypress.Commands.add('removerOfertaDosFavoritos', (index = 0) => {
  cy.visit('/favoritos')
  cy.wait(2000)
  
  cy.scrollTo('bottom', { duration: 1000 })
  cy.wait(500)
  cy.scrollTo('top', { duration: 1000 })
  cy.wait(500)
  
  cy.encontrarBotoesFavorito().then(($botoes) => {
    const $botoesFavoritados = $botoes.filter((i, btn) => {
      const svg = Cypress.$(btn).find('svg.lucide-heart')
      const fill = svg.attr('fill')
      return fill && fill !== 'none'
    })
    
    if ($botoesFavoritados.length > index) {
      const $btn = $botoesFavoritados.eq(index)
      cy.wrap($btn).scrollIntoView({ duration: 500 })
      cy.wait(500)
      cy.wrap($btn).click({ force: true })
      cy.contains('Removido dos favoritos', { timeout: 5000 }).should('be.visible')
      cy.wait(2000)
    }
  })
})

/**
 * Limpa todos os favoritos de ofertas
 */
Cypress.Commands.add('limparFavoritos', () => {
  cy.visit('/favoritos')
  cy.wait(2000)
  
  cy.get('body').then(($body) => {
    if (!$body.text().includes('Nenhuma oferta favorita')) {
      cy.scrollTo('bottom', { duration: 1000 })
      cy.wait(500)
      cy.scrollTo('top', { duration: 1000 })
      cy.wait(500)
      
      cy.encontrarBotoesFavorito().then(($botoes) => {
        if ($botoes.length > 0) {
          cy.wrap($botoes).each(($btn) => {
            cy.wrap($btn).scrollIntoView({ duration: 300 })
            cy.wrap($btn).click({ force: true })
            cy.wait(1500)
          })
          cy.wait(2000)
        }
      })
    }
  })
})

/**
 * Valida que ofertas favoritas estão sendo exibidas
 * @param {number} quantidadeMinima - Quantidade mínima esperada
 */
Cypress.Commands.add('validarOfertasFavoritas', (quantidadeMinima = 1) => {
  cy.get('div[class*="rounded-xl"]').should('have.length.gte', quantidadeMinima)
})

/**
 * Valida botão de favorito em um card
 * @param {number} index - Índice do card
 * @param {boolean} deveFavoritado - true se deve estar favoritado
 */
Cypress.Commands.add('validarBotaoFavorito', (index, deveFavoritado = false) => {
  cy.scrollTo('bottom', { duration: 1000 })
  cy.wait(500)
  cy.scrollTo('top', { duration: 1000 })
  cy.wait(500)
  
  cy.encontrarBotoesFavorito().then(($botoes) => {
    if ($botoes.length > index) {
      const $btn = $botoes.eq(index)
      cy.wrap($btn).scrollIntoView({ duration: 500 })
      cy.wait(500)
      
      const svg = $btn.find('svg.lucide-heart')
      const fill = svg.attr('fill')
      
      if (deveFavoritado) {
        expect(fill).to.not.equal('none')
        expect(fill).to.exist
      } else {
        expect(fill === 'none' || !fill).to.be.true
      }
    }
  })
})

/**
 * Valida estrutura do botão de favorito
 */
Cypress.Commands.add('validarEstruturaBotaoFavorito', () => {
  cy.visit('/home')
  cy.wait(3000)
  
  cy.scrollTo('bottom', { duration: 1000 })
  cy.wait(500)
  cy.scrollTo('top', { duration: 1000 })
  cy.wait(500)
  
  cy.encontrarBotoesFavorito().then(($botoes) => {
    if ($botoes.length > 0) {
      cy.wrap($botoes.first()).scrollIntoView()
      
      cy.wrap($botoes.first()).should(($btn) => {
        expect($btn).to.have.class('absolute')
        expect($btn).to.have.class('right-2')
        expect($btn).to.have.class('top-2')
        expect($btn).to.have.class('rounded-full')
        expect($btn).to.have.class('cursor-pointer')
        expect($btn.find('svg.lucide-heart').length).to.be.greaterThan(0)
      })
    }
  })
})

/**
 * Adiciona múltiplas ofertas aos favoritos
 * @param {number} quantidade - Quantidade de ofertas (padrão: 2)
 */
Cypress.Commands.add('adicionarMultiplosAosFavoritos', (quantidade = 2) => {
  for (let i = 0; i < quantidade; i++) {
    cy.adicionarOfertaAosFavoritos(i)
    cy.wait(1500)
  }
})

/**
 * Valida quantidade de favoritos na página
 * @param {number} quantidadeEsperada - Quantidade esperada
 */
Cypress.Commands.add('validarQuantidadeFavoritos', (quantidadeEsperada) => {
  cy.visit('/favoritos')
  cy.wait(2000)
  
  if (quantidadeEsperada === 0) {
    cy.validarFavoritosVazio()
  } else {
    cy.scrollTo('bottom', { duration: 1000 })
    cy.wait(500)
    cy.scrollTo('top', { duration: 1000 })
    cy.wait(500)
    
    cy.get('div[class*="rounded-xl"]').should('have.length', quantidadeEsperada)
  }
})

/**
 * Valida sincronização entre home e favoritos
 * @param {number} index - Índice da oferta
 */
Cypress.Commands.add('validarSincronizacaoFavorito', (index = 0) => {
  cy.visit('/home')
  cy.wait(2000)
  cy.adicionarOfertaAosFavoritos(index)
  
  cy.visit('/favoritos')
  cy.wait(2000)
  
  cy.get('body').then(($body) => {
    const temFavoritos = !$body.text().includes('Nenhuma oferta favorita')
    expect(temFavoritos).to.be.true
  })
})

// ========================================
// FAVORITOS DE LOJAS
// ========================================

/**
 * Encontra botões de favorito nas lojas (BUTTON com top-3 right-3)
 */
Cypress.Commands.add('encontrarBotoesFavoritoLojas', () => {
  cy.scrollTo('bottom', { duration: 1000 })
  cy.wait(500)
  cy.scrollTo('top', { duration: 1000 })
  cy.wait(500)
  
  return cy.get('button.absolute.top-3.right-3.rounded-full').filter((i, btn) => {
    const $btn = Cypress.$(btn)
    const temHeartIcon = $btn.find('svg.lucide-heart').length > 0
    const classes = $btn.attr('class') || ''
    const temClasses = classes.includes('backdrop-blur-sm') && 
                      classes.includes('z-10') && 
                      classes.includes('p-1.5')
    return temHeartIcon && temClasses
  }).then(($botoesFiltrados) => {
    return cy.wrap($botoesFiltrados)
  })
})

/**
 * Adiciona uma loja aos favoritos pela página /lojas
 * @param {number} index - Índice da loja (0 = primeira)
 */
Cypress.Commands.add('adicionarLojaAosFavoritos', (index = 0) => {
  cy.visit('/lojas')
  cy.wait(3000)
  
  cy.get('div[class*="rounded-xl"]').should('have.length.greaterThan', 0)
  
  cy.scrollTo('bottom', { duration: 1000 })
  cy.wait(500)
  cy.scrollTo('top', { duration: 1000 })
  cy.wait(500)
  
  cy.encontrarBotoesFavoritoLojas().then(($botoes) => {
    if ($botoes.length > index) {
      const $btn = $botoes.eq(index)
      cy.wrap($btn).scrollIntoView({ duration: 500 })
      cy.wait(500)
      
      const svg = $btn.find('svg.lucide-heart')
      const fill = svg.attr('fill')
      const hasFillClass = svg.hasClass('fill-red-500')
      
      if ((fill === 'none' || !fill) && !hasFillClass) {
        cy.wrap($btn).click({ force: true })
        cy.contains('Adicionado aos favoritos', { timeout: 5000 }).should('be.visible')
        cy.wait(2000)
      }
    }
  })
})

/**
 * Remove loja dos favoritos
 * @param {number} index - Índice da loja
 */
Cypress.Commands.add('removerLojaDosFavoritos', (index = 0) => {
  cy.visit('/favoritos')
  cy.wait(2000)
  cy.contains('Lojas Favoritas').scrollIntoView()
  cy.wait(1000)
  
  cy.scrollTo('bottom', { duration: 1000 })
  cy.wait(500)
  
  cy.get('button.absolute.top-3.right-3.rounded-full').filter((i, btn) => {
    return Cypress.$(btn).find('svg.lucide-heart').length > 0
  }).then(($botoes) => {
    const $botoesFavoritados = $botoes.filter((i, btn) => {
      const svg = Cypress.$(btn).find('svg.lucide-heart')
      const fill = svg.attr('fill')
      const hasFillClass = svg.hasClass('fill-red-500')
      return (fill && fill !== 'none') || hasFillClass
    })
    
    if ($botoesFavoritados.length > index) {
      const $btn = $botoesFavoritados.eq(index)
      cy.wrap($btn).scrollIntoView({ duration: 500 })
      cy.wait(500)
      cy.wrap($btn).click({ force: true })
      cy.contains('Removido dos favoritos', { timeout: 5000 }).should('be.visible')
      cy.wait(2000)
    }
  })
})

/**
 * Limpa todas as lojas favoritas
 */
Cypress.Commands.add('limparLojasFavoritas', () => {
  cy.visit('/favoritos')
  cy.wait(2000)
  cy.contains('Lojas Favoritas').scrollIntoView()
  cy.wait(1000)
  
  cy.get('body').then(($body) => {
    if (!$body.text().includes('Nenhuma loja favorita')) {
      cy.scrollTo('bottom', { duration: 1000 })
      cy.wait(500)
      
      cy.get('button.absolute.top-3.right-3.rounded-full').filter((i, btn) => {
        return Cypress.$(btn).find('svg.lucide-heart').length > 0
      }).then(($botoes) => {
        if ($botoes.length > 0) {
          cy.wrap($botoes).each(($btn) => {
            cy.wrap($btn).scrollIntoView({ duration: 300 })
            cy.wrap($btn).click({ force: true })
            cy.wait(1500)
          })
          cy.wait(2000)
        }
      })
    }
  })
})

/**
 * Valida que lojas favoritas estão sendo exibidas
 * @param {number} quantidadeMinima - Quantidade mínima esperada
 */
Cypress.Commands.add('validarLojasFavoritas', (quantidadeMinima = 1) => {
  cy.contains('Lojas Favoritas').scrollIntoView()
  cy.wait(1000)
  cy.get('div[class*="rounded-xl"]').should('have.length.gte', quantidadeMinima)
})

/**
 * Valida botão de favorito de loja
 * @param {number} index - Índice da loja
 * @param {boolean} deveFavoritado - true se deve estar favoritado
 */
Cypress.Commands.add('validarBotaoFavoritoLoja', (index, deveFavoritado = false) => {
  cy.scrollTo('bottom', { duration: 1000 })
  cy.wait(500)
  cy.scrollTo('top', { duration: 1000 })
  cy.wait(500)
  
  cy.encontrarBotoesFavoritoLojas().then(($botoes) => {
    if ($botoes.length > index) {
      const $btn = $botoes.eq(index)
      cy.wrap($btn).scrollIntoView({ duration: 500 })
      cy.wait(500)
      
      const svg = $btn.find('svg.lucide-heart')
      const fill = svg.attr('fill')
      const hasFillClass = svg.hasClass('fill-red-500')
      
      if (deveFavoritado) {
        expect(fill !== 'none' || hasFillClass).to.be.true
      } else {
        expect((fill === 'none' || !fill) && !hasFillClass).to.be.true
      }
    }
  })
})

/**
 * Valida sincronização entre /lojas e /favoritos
 * @param {number} index - Índice da loja
 */
Cypress.Commands.add('validarSincronizacaoLojaFavorita', (index = 0) => {
  cy.visit('/lojas')
  cy.wait(2000)
  cy.adicionarLojaAosFavoritos(index)
  
  cy.visit('/favoritos')
  cy.wait(2000)
  cy.contains('Lojas Favoritas').scrollIntoView()
  cy.wait(1000)
  
  cy.get('body').then(($body) => {
    const temLojasFavoritas = !$body.text().includes('Nenhuma loja favorita')
    expect(temLojasFavoritas).to.be.true
  })
})

/**
 * Valida carrossel de navegação (setas)
 */
Cypress.Commands.add('validarCarrosselFavoritos', () => {
  cy.get('button').find('svg').filter(':visible').should('have.length.gte', 2)
})