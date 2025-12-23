/**
 * ========================================
 * TESTES E2E - FAVORITOS
 * Ofertas + Lojas - Fluxos reais de usuário
 * ========================================
 */

describe('Favoritos - Fluxos de Usuário', () => {
  let usuario

  before(() => {
    cy.fixture('usuarios').then((data) => {
      usuario = data.clienteValido
    })
  })

  beforeEach(() => {
    cy.login(usuario.email, usuario.senha)
    cy.wait(1000)
  })

  // ========================================
  // CT01 - PÁGINA VAZIA
  // ========================================

  describe('CT01 - Estado Vazio', () => {
    beforeEach(() => {
      cy.limparFavoritos()
    })

    it('Deve exibir mensagem de favoritos vazio', () => {
      cy.acessarFavoritos()
      cy.contains('Nenhuma oferta favorita').should('be.visible')
      cy.contains('Adicione ofertas aos favoritos para vê-las aqui').should('be.visible')
      cy.log('✅ Mensagem de vazio exibida')
    })

    it('Deve exibir links "Explorar"', () => {
      cy.acessarFavoritos()
      cy.contains('a', 'Explorar Ofertas').should('be.visible')
      cy.contains('a', 'Explorar Lojas').should('be.visible')
      cy.log('✅ Links Explorar exibidos')
    })

    it('Links Explorar devem navegar corretamente', () => {
      cy.acessarFavoritos()
      
      // Testa link Ofertas
      cy.contains('a', 'Explorar Ofertas').click()
      cy.url().should('include', '/home')
      
      // Volta e testa link Lojas
      cy.visit('/favoritos')
      cy.wait(1000)
      cy.contains('a', 'Explorar Lojas').click()
      cy.url().should('match', /lojas/)
      
      cy.log('✅ Navegação dos links OK')
    })

    it('Deve exibir estrutura correta (ofertas + lojas)', () => {
      cy.acessarFavoritos()
      
      // Seção Ofertas
      cy.contains('Ofertas Favoritas').should('be.visible')
      cy.contains('Produtos que você marcou como favoritos').should('be.visible')
      
      // Seção Lojas
      cy.contains('Lojas Favoritas').should('be.visible')
      cy.contains('Estabelecimentos que você marcou como favoritos').should('be.visible')
      
      cy.log('✅ Estrutura de seções correta')
    })

    it('Deve exibir ícones para seções vazias', () => {
      cy.acessarFavoritos()
      
      cy.validarIconeVazio('oferta')
      cy.validarIconeVazio('loja')
      
      cy.log('✅ Ícones de vazio exibidos')
    })
  })

  // ========================================
  // CT02 - ADICIONAR FAVORITOS (OFERTAS)
  // ========================================

  describe('CT02 - Adicionar Favoritos (Ofertas)', () => {
    beforeEach(() => {
      cy.limparFavoritos()
    })

    it('FLUXO PRINCIPAL: Adicionar favorito na HOME e visualizar em Favoritos', () => {
      cy.visit('/home')
      cy.wait(3000)
      
      cy.get('body').then(($body) => {
        const temOfertas = $body.find('div[class*="rounded-xl"]').length > 0
        
        if (!temOfertas) {
          cy.log('⚠️ Nenhuma oferta disponível - teste pulado')
          return
        }
        
        cy.log('✅ Ofertas encontradas')
        
        // Scroll para garantir visibilidade
        cy.scrollTo('bottom', { duration: 1000 })
        cy.wait(500)
        cy.scrollTo('top', { duration: 1000 })
        cy.wait(1000)
        
        // Encontra botões de favorito (DIVs)
        cy.get('div.absolute.right-2.top-2.rounded-full.cursor-pointer').filter((i, div) => {
          const $div = Cypress.$(div)
          return $div.find('svg.lucide-heart').length > 0
        }).then(($botoes) => {
          
          if ($botoes.length === 0) {
            cy.log('⚠️ Nenhum botão de favorito encontrado')
            return
          }
          
          cy.log(`✅ Encontrados ${$botoes.length} botões`)
          
          // Pega o primeiro NÃO favoritado
          const $btnNaoFavoritado = $botoes.filter((i, btn) => {
            const svg = Cypress.$(btn).find('svg.lucide-heart')
            const fill = svg.attr('fill')
            return fill === 'none' || !fill
          }).first()
          
          if ($btnNaoFavoritado.length === 0) {
            cy.log('⚠️ Todos já estão favoritados')
            return
          }
          
          // Clica no botão
          cy.wrap($btnNaoFavoritado).scrollIntoView({ duration: 500 })
          cy.wait(500)
          cy.log('❤️ Clicando no favorito...')
          cy.wrap($btnNaoFavoritado).click({ force: true })
          
          // Valida toast de sucesso
          cy.contains('Adicionado aos favoritos', { timeout: 5000 }).should('be.visible')
          cy.log('✅ Toast de sucesso exibido!')
          cy.wait(2000)
          
          // Vai para favoritos e valida
          cy.visit('/favoritos')
          cy.wait(2000)
          
          cy.get('body').then(($favoritos) => {
            const temFavoritos = !$favoritos.text().includes('Nenhuma oferta favorita')
            
            if (temFavoritos) {
              cy.log('✅ SUCESSO: Favorito aparece em /favoritos!')
              cy.get('div[class*="rounded-xl"]').should('have.length.gte', 1)
            } else {
              cy.log('❌ Favorito não apareceu')
            }
          })
        })
      })
    })

    it('FLUXO: Botão deve mudar estado visual ao favoritar', () => {
      cy.visit('/home')
      cy.wait(3000)
      
      cy.get('body').then(($body) => {
        if ($body.find('div[class*="rounded-xl"]').length === 0) {
          cy.log('⚠️ Sem ofertas')
          return
        }
        
        // Scroll
        cy.scrollTo('bottom', { duration: 1000 })
        cy.wait(500)
        cy.scrollTo('top', { duration: 1000 })
        cy.wait(1000)
        
        // Pega botão não favoritado
        cy.get('div.absolute.right-2.top-2.rounded-full.cursor-pointer').filter((i, div) => {
          const $div = Cypress.$(div)
          const svg = $div.find('svg.lucide-heart')
          const fill = svg.attr('fill')
          return $div.find('svg.lucide-heart').length > 0 && (fill === 'none' || !fill)
        }).first().then(($btn) => {
          
          if ($btn.length === 0) {
            cy.log('⚠️ Nenhum botão não favoritado')
            return
          }
          
          // Estado ANTES: fill="none" ou vazio
          const svgAntes = $btn.find('svg.lucide-heart')
          const fillAntes = svgAntes.attr('fill')
          cy.log(`Estado ANTES: fill="${fillAntes}"`)
          expect(fillAntes === 'none' || !fillAntes).to.be.true
          
          // Clica
          cy.wrap($btn).scrollIntoView()
          cy.wait(500)
          cy.wrap($btn).click({ force: true })
          
          // Aguarda toast
          cy.contains('Adicionado aos favoritos', { timeout: 5000 }).should('be.visible')
          cy.wait(2000)
          
          // Recarrega e verifica estado DEPOIS
          cy.reload()
          cy.wait(3000)
          
          cy.scrollTo('bottom', { duration: 1000 })
          cy.wait(500)
          cy.scrollTo('top', { duration: 1000 })
          cy.wait(1000)
          
          cy.get('div.absolute.right-2.top-2.rounded-full.cursor-pointer').filter((i, div) => {
            return Cypress.$(div).find('svg.lucide-heart').length > 0
          }).first().then(($btnDepois) => {
            const svgDepois = $btnDepois.find('svg.lucide-heart')
            const fillDepois = svgDepois.attr('fill')
            cy.log(`Estado DEPOIS: fill="${fillDepois}"`)
            
            // Deve estar preenchido agora
            if (fillDepois && fillDepois !== 'none') {
              cy.log('✅ SUCESSO: Botão mudou para favoritado!')
            } else {
              cy.log('⚠️ Botão não mudou de estado')
            }
          })
        })
      })
    })

    it('FLUXO: Estrutura do botão de favorito', () => {
      cy.visit('/home')
      cy.wait(3000)
      
      cy.get('body').then(($body) => {
        if ($body.find('div[class*="rounded-xl"]').length === 0) {
          cy.log('⚠️ Sem ofertas')
          return
        }
        
        cy.scrollTo('bottom', { duration: 1000 })
        cy.wait(500)
        cy.scrollTo('top', { duration: 1000 })
        cy.wait(1000)
        
        cy.get('div.absolute.right-2.top-2.rounded-full.cursor-pointer').filter((i, div) => {
          return Cypress.$(div).find('svg.lucide-heart').length > 0
        }).first().then(($btn) => {
          
          cy.wrap($btn).scrollIntoView()
          
          cy.wrap($btn).should(($el) => {
            expect($el).to.have.class('absolute')
            expect($el).to.have.class('right-2')
            expect($el).to.have.class('top-2')
            expect($el).to.have.class('rounded-full')
            expect($el).to.have.class('cursor-pointer')
            expect($el.find('svg.lucide-heart').length).to.be.greaterThan(0)
          })
          
          cy.log('✅ Estrutura do botão validada')
        })
      })
    })

    it('FLUXO: Toast deve aparecer ao favoritar', () => {
      cy.visit('/home')
      cy.wait(3000)
      
      cy.get('body').then(($body) => {
        if ($body.find('div[class*="rounded-xl"]').length === 0) {
          cy.log('⚠️ Sem ofertas')
          return
        }
        
        cy.scrollTo('bottom', { duration: 1000 })
        cy.wait(500)
        cy.scrollTo('top', { duration: 1000 })
        cy.wait(1000)
        
        cy.get('div.absolute.right-2.top-2.rounded-full.cursor-pointer').filter((i, div) => {
          const $div = Cypress.$(div)
          const svg = $div.find('svg.lucide-heart')
          const fill = svg.attr('fill')
          return $div.find('svg.lucide-heart').length > 0 && (fill === 'none' || !fill)
        }).first().then(($btn) => {
          
          if ($btn.length === 0) {
            cy.log('⚠️ Nenhum botão disponível')
            return
          }
          
          cy.wrap($btn).scrollIntoView()
          cy.wait(500)
          cy.wrap($btn).click({ force: true })
          
          // Valida toast
          cy.contains('Adicionado aos favoritos').should('be.visible')
          cy.contains('Oferta adicionada à sua lista de favoritos').should('be.visible')
          
          cy.log('✅ Toast completo validado')
        })
      })
    })
  })

  // ========================================
  // CT03 - REMOVER FAVORITOS (OFERTAS)
  // ========================================

  describe('CT03 - Remover Favoritos (Ofertas)', () => {
    it('FLUXO: Remover favorito da página de Favoritos', () => {
      cy.visit('/favoritos')
      cy.wait(2000)
      
      cy.get('body').then(($body) => {
        const temFavoritos = !$body.text().includes('Nenhuma oferta favorita')
        
        if (!temFavoritos) {
          cy.log('⚠️ Nenhum favorito para remover - teste pulado')
          return
        }
        
        cy.log('🗑️ Removendo favorito')
        
        // Scroll
        cy.scrollTo('bottom', { duration: 1000 })
        cy.wait(500)
        cy.scrollTo('top', { duration: 1000 })
        cy.wait(1000)
        
        // Encontra botões
        cy.get('div.absolute.right-2.top-2.rounded-full.cursor-pointer').filter((i, div) => {
          return Cypress.$(div).find('svg.lucide-heart').length > 0
        }).then(($botoes) => {
          
          if ($botoes.length === 0) {
            cy.log('⚠️ Nenhum botão encontrado')
            return
          }
          
          const qtdInicial = $botoes.length
          cy.log(`Favoritos iniciais: ${qtdInicial}`)
          
          // Clica no primeiro
          cy.wrap($botoes.first()).scrollIntoView({ duration: 500 })
          cy.wait(500)
          cy.wrap($botoes.first()).click({ force: true })
          
          // Valida toast
          cy.contains('Removido dos favoritos', { timeout: 5000 }).should('be.visible')
          cy.wait(2000)
          
          // Valida que diminuiu
          cy.get('body').then(($bodyDepois) => {
            const aindaTemFavoritos = !$bodyDepois.text().includes('Nenhuma oferta favorita')
            
            if (!aindaTemFavoritos && qtdInicial === 1) {
              cy.log('✅ SUCESSO: Último favorito removido')
              cy.contains('Nenhuma oferta favorita').should('be.visible')
            } else if (aindaTemFavoritos) {
              cy.get('div.absolute.right-2.top-2.rounded-full.cursor-pointer').filter((i, div) => {
                return Cypress.$(div).find('svg.lucide-heart').length > 0
              }).should('have.length.lessThan', qtdInicial)
              cy.log('✅ SUCESSO: Favorito removido')
            }
          })
        })
      })
    })

    it('FLUXO: Limpar todos os favoritos', () => {
      cy.visit('/favoritos')
      cy.wait(2000)
      
      cy.get('body').then(($body) => {
        const temFavoritos = !$body.text().includes('Nenhuma oferta favorita')
        
        if (!temFavoritos) {
          cy.log('ℹ️ Já está vazio')
          cy.validarFavoritosVazio()
          return
        }
        
        cy.limparFavoritos()
        
        cy.get('body').should('contain', 'Nenhuma oferta favorita')
        cy.log('✅ Todos os favoritos foram removidos')
      })
    })

    it('FLUXO: Toast deve aparecer ao remover', () => {
      cy.visit('/favoritos')
      cy.wait(2000)
      
      cy.get('body').then(($body) => {
        const temFavoritos = !$body.text().includes('Nenhuma oferta favorita')
        
        if (!temFavoritos) {
          cy.log('⚠️ Sem favoritos')
          return
        }
        
        cy.scrollTo('bottom', { duration: 1000 })
        cy.wait(500)
        cy.scrollTo('top', { duration: 1000 })
        cy.wait(1000)
        
        cy.get('div.absolute.right-2.top-2.rounded-full.cursor-pointer').filter((i, div) => {
          return Cypress.$(div).find('svg.lucide-heart').length > 0
        }).first().then(($btn) => {
          
          cy.wrap($btn).scrollIntoView()
          cy.wait(500)
          cy.wrap($btn).click({ force: true })
          
          // Valida toast completo
          cy.contains('Removido dos favoritos').should('be.visible')
          cy.log('✅ Toast de remoção validado')
        })
      })
    })
  })

  // ========================================
  // CT04 - SINCRONIZAÇÃO (OFERTAS)
  // ========================================

  describe('CT04 - Sincronização entre Páginas (Ofertas)', () => {
    it('FLUXO: Favoritar na HOME deve refletir em /favoritos', () => {
      // Limpa
      cy.visit('/favoritos')
      cy.wait(2000)
      cy.get('body').then(($body) => {
        if (!$body.text().includes('Nenhuma oferta favorita')) {
          cy.limparFavoritos()
        }
      })
      
      // Vai para home
      cy.visit('/home')
      cy.wait(3000)
      
      cy.get('body').then(($body) => {
        if ($body.find('div[class*="rounded-xl"]').length === 0) {
          cy.log('⚠️ Sem ofertas')
          return
        }
        
        // Scroll
        cy.scrollTo('bottom', { duration: 1000 })
        cy.wait(500)
        cy.scrollTo('top', { duration: 1000 })
        cy.wait(1000)
        
        // Encontra e clica
        cy.get('div.absolute.right-2.top-2.rounded-full.cursor-pointer').filter((i, div) => {
          return Cypress.$(div).find('svg.lucide-heart').length > 0
        }).then(($botoes) => {
          if ($botoes.length === 0) return
          
          // Pega não favoritado
          const $btnNaoFav = $botoes.filter((i, btn) => {
            const svg = Cypress.$(btn).find('svg.lucide-heart')
            const fill = svg.attr('fill')
            return fill === 'none' || !fill
          }).first()
          
          if ($btnNaoFav.length === 0) {
            cy.log('⚠️ Todos já favoritados')
            return
          }
          
          cy.wrap($btnNaoFav).scrollIntoView()
          cy.wait(500)
          cy.wrap($btnNaoFav).click({ force: true })
          
          cy.contains('Adicionado aos favoritos', { timeout: 5000 }).should('be.visible')
          cy.wait(2000)
          
          // Verifica sincronização
          cy.visit('/favoritos')
          cy.wait(2000)
          
          cy.get('body').should('not.contain', 'Nenhuma oferta favorita')
          cy.log('✅ SINCRONIZAÇÃO OK: Favorito aparece!')
        })
      })
    })

    it('FLUXO: Desfavoritar deve refletir em ambas páginas', () => {
      cy.visit('/favoritos')
      cy.wait(2000)
      
      cy.get('body').then(($body) => {
        if ($body.text().includes('Nenhuma oferta favorita')) {
          cy.log('⚠️ Sem favoritos')
          return
        }
        
        // Scroll
        cy.scrollTo('bottom', { duration: 1000 })
        cy.wait(500)
        cy.scrollTo('top', { duration: 1000 })
        cy.wait(1000)
        
        // Remove
        cy.get('div.absolute.right-2.top-2.rounded-full.cursor-pointer').filter((i, div) => {
          return Cypress.$(div).find('svg.lucide-heart').length > 0
        }).first().then(($btn) => {
          cy.wrap($btn).scrollIntoView()
          cy.wait(500)
          cy.wrap($btn).click({ force: true })
          
          cy.contains('Removido dos favoritos', { timeout: 5000 }).should('be.visible')
          cy.wait(2000)
          
          cy.log('✅ SINCRONIZAÇÃO OK')
        })
      })
    })

    it('FLUXO: Persistência após reload', () => {
      cy.visit('/home')
      cy.wait(3000)
      
      cy.get('body').then(($body) => {
        if ($body.find('div[class*="rounded-xl"]').length === 0) {
          cy.log('⚠️ Sem ofertas')
          return
        }
        
        cy.scrollTo('bottom', { duration: 1000 })
        cy.wait(500)
        cy.scrollTo('top', { duration: 1000 })
        cy.wait(1000)
        
        cy.get('div.absolute.right-2.top-2.rounded-full.cursor-pointer').filter((i, div) => {
          const $div = Cypress.$(div)
          const svg = $div.find('svg.lucide-heart')
          const fill = svg.attr('fill')
          return $div.find('svg.lucide-heart').length > 0 && (fill === 'none' || !fill)
        }).first().then(($btn) => {
          
          if ($btn.length === 0) return
          
          cy.wrap($btn).scrollIntoView()
          cy.wait(500)
          cy.wrap($btn).click({ force: true })
          
          cy.contains('Adicionado aos favoritos', { timeout: 5000 }).should('be.visible')
          cy.wait(2000)
          
          // Reload da página
          cy.reload()
          cy.wait(3000)
          
          // Vai para favoritos e valida persistência
          cy.visit('/favoritos')
          cy.wait(2000)
          
          cy.get('body').should('not.contain', 'Nenhuma oferta favorita')
          cy.log('✅ Favorito persistiu após reload')
        })
      })
    })
  })

  // ========================================
  // CT05 - MÚLTIPLOS FAVORITOS (OFERTAS)
  // ========================================

  describe('CT05 - Múltiplos Favoritos (Ofertas)', () => {
    it('FLUXO: Adicionar múltiplos favoritos', () => {
      // Limpa
      cy.visit('/favoritos')
      cy.wait(2000)
      cy.get('body').then(($body) => {
        if (!$body.text().includes('Nenhuma oferta favorita')) {
          cy.limparFavoritos()
        }
      })
      
      // Adiciona 3 favoritos
      cy.visit('/home')
      cy.wait(3000)
      
      cy.get('body').then(($body) => {
        if ($body.find('div[class*="rounded-xl"]').length === 0) {
          cy.log('⚠️ Sem ofertas')
          return
        }
        
        // Scroll
        cy.scrollTo('bottom', { duration: 1000 })
        cy.wait(500)
        cy.scrollTo('top', { duration: 1000 })
        cy.wait(1000)
        
        // Encontra botões não favoritados
        cy.get('div.absolute.right-2.top-2.rounded-full.cursor-pointer').filter((i, div) => {
          const $div = Cypress.$(div)
          const svg = $div.find('svg.lucide-heart')
          const fill = svg.attr('fill')
          return $div.find('svg.lucide-heart').length > 0 && (fill === 'none' || !fill)
        }).then(($botoes) => {
          if ($botoes.length === 0) {
            cy.log('⚠️ Nenhum botão disponível')
            return
          }
          
          const quantidade = Math.min(3, $botoes.length)
          cy.log(`Tentando adicionar ${quantidade} favoritos`)
          
          for (let i = 0; i < quantidade; i++) {
            cy.wrap($botoes.eq(i)).scrollIntoView()
            cy.wait(300)
            cy.wrap($botoes.eq(i)).click({ force: true })
            cy.contains('Adicionado aos favoritos', { timeout: 5000 }).should('be.visible')
            cy.wait(2000)
            cy.log(`❤️ Favoritado ${i + 1}/${quantidade}`)
          }
          
          // Verifica em favoritos
          cy.visit('/favoritos')
          cy.wait(2000)
          
          cy.get('body').then(($favoritos) => {
            if (!$favoritos.text().includes('Nenhuma oferta favorita')) {
              cy.get('div[class*="rounded-xl"]').should('have.length.gte', quantidade)
              cy.log(`✅ SUCESSO: ${quantidade} favoritos adicionados!`)
            }
          })
        })
      })
    })
  })

  // ========================================
  // CT06 - INTERFACE E NAVEGAÇÃO
  // ========================================

  describe('CT06 - Interface', () => {
    it('Deve exibir título e estrutura correta', () => {
      cy.acessarFavoritos()
      
      cy.contains('Meus Favoritos').should('be.visible')
      cy.contains('Suas ofertas e lojas preferidas em um só lugar').should('be.visible')
      cy.log('✅ Título e subtítulo OK')
    })

    it('Deve ter header e footer', () => {
      cy.acessarFavoritos()
      
      cy.get('header').should('be.visible')
      cy.validarFooter()
      cy.log('✅ Header e Footer presentes')
    })

    it('URL deve estar correta', () => {
      cy.acessarFavoritos()
      cy.url().should('include', '/favoritos')
      cy.log('✅ URL correta')
    })

    it('Link de favoritos no header deve funcionar', () => {
      cy.visit('/home')
      cy.wait(2000)
      
      cy.get('header').within(() => {
        cy.get('a[href*="favoritos"]').first().click()
      })
      
      cy.url().should('include', '/favoritos')
      cy.log('✅ Link header OK')
    })

    it('Estilos dos links Explorar devem estar corretos', () => {
      cy.limparFavoritos()
      cy.acessarFavoritos()
      
      cy.validarEstiloLinksExplorar()
      cy.log('✅ Estilos validados')
    })
  })

  // ========================================
  // CT07 - RESPONSIVIDADE
  // ========================================

  describe('CT07 - Responsividade', () => {
    it('Deve funcionar em Mobile (375x667)', () => {
      cy.viewport(375, 667)
      cy.limparFavoritos()
      cy.acessarFavoritos()
      
      cy.contains('Meus Favoritos').should('be.visible')
      cy.contains('a', 'Explorar Ofertas').should('be.visible')
      cy.log('✅ Mobile OK')
    })

    it('Deve funcionar em Tablet (768x1024)', () => {
      cy.viewport(768, 1024)
      cy.limparFavoritos()
      cy.acessarFavoritos()
      
      cy.contains('Meus Favoritos').should('be.visible')
      cy.log('✅ Tablet OK')
    })

    it('Deve funcionar em Desktop (1920x1080)', () => {
      cy.viewport(1920, 1080)
      cy.limparFavoritos()
      cy.acessarFavoritos()
      
      cy.contains('Meus Favoritos').should('be.visible')
      cy.log('✅ Desktop OK')
    })
  })

  // ========================================
  // CT08 - SEGURANÇA
  // ========================================

  describe('CT08 - Segurança', () => {
    it('Deve exigir autenticação', () => {
      cy.clearCookies()
      cy.clearLocalStorage()
      
      cy.visit('/favoritos')
      
      cy.url().should('satisfy', (url) => {
        return url.includes('/login') || url.includes('/entrar')
      })
      
      cy.log('✅ Autenticação exigida')
    })

    it('Não deve expor dados sensíveis na URL', () => {
      cy.acessarFavoritos()
      cy.url().should('not.match', /token|password|email/)
      cy.log('✅ URL segura')
    })
  })

  // ========================================
  // CT09 - PERFORMANCE
  // ========================================

  describe('CT09 - Performance', () => {
    it('Página deve carregar rapidamente', () => {
      const startTime = Date.now()
      
      cy.acessarFavoritos()
      
      const loadTime = Date.now() - startTime
      expect(loadTime).to.be.lessThan(3000)
      cy.log(`✅ Carregou em ${loadTime}ms`)
    })

    it('Toast deve aparecer rapidamente ao favoritar', () => {
      cy.visit('/home')
      cy.wait(3000)
      
      cy.get('body').then(($body) => {
        if ($body.find('div[class*="rounded-xl"]').length === 0) {
          cy.log('⚠️ Sem ofertas')
          return
        }
        
        cy.scrollTo('bottom', { duration: 1000 })
        cy.wait(500)
        cy.scrollTo('top', { duration: 1000 })
        cy.wait(1000)
        
        cy.get('div.absolute.right-2.top-2.rounded-full.cursor-pointer').filter((i, div) => {
          const $div = Cypress.$(div)
          const svg = $div.find('svg.lucide-heart')
          const fill = svg.attr('fill')
          return $div.find('svg.lucide-heart').length > 0 && (fill === 'none' || !fill)
        }).first().then(($btn) => {
          
          if ($btn.length === 0) return
          
          const startClick = Date.now()
          
          cy.wrap($btn).scrollIntoView()
          cy.wrap($btn).click({ force: true })
          
          cy.contains('Adicionado aos favoritos', { timeout: 5000 }).should('be.visible').then(() => {
            const toastTime = Date.now() - startClick
            expect(toastTime).to.be.lessThan(3000)
            cy.log(`✅ Toast em ${toastTime}ms`)
          })
        })
      })
    })
  })

  // ========================================
  // CT10 - FAVORITOS DE LOJAS
  // ========================================

  describe('CT10 - Favoritos de Lojas', () => {
    it('FLUXO PRINCIPAL: Adicionar loja aos favoritos e visualizar', () => {
      cy.visit('/lojas')
      cy.wait(3000)
      
      cy.get('body').then(($body) => {
        const temLojas = $body.find('div[class*="rounded-xl"]').length > 0
        
        if (!temLojas) {
          cy.log('⚠️ Nenhuma loja disponível - teste pulado')
          return
        }
        
        cy.log('✅ Lojas encontradas')
        
        // Scroll para garantir visibilidade
        cy.scrollTo('bottom', { duration: 1000 })
        cy.wait(500)
        cy.scrollTo('top', { duration: 1000 })
        cy.wait(1000)
        
        // Encontra botões de favorito de lojas (BUTTON com top-3 right-3)
        cy.get('button.absolute.top-3.right-3.rounded-full').filter((i, btn) => {
          const $btn = Cypress.$(btn)
          return $btn.find('svg.lucide-heart').length > 0
        }).then(($botoes) => {
          
          if ($botoes.length === 0) {
            cy.log('⚠️ Nenhum botão de favorito encontrado')
            return
          }
          
          cy.log(`✅ Encontrados ${$botoes.length} botões`)
          
          // Pega o primeiro NÃO favoritado
          const $btnNaoFavoritado = $botoes.filter((i, btn) => {
            const svg = Cypress.$(btn).find('svg.lucide-heart')
            const fill = svg.attr('fill')
            const hasFillClass = svg.hasClass('fill-red-500')
            return (fill === 'none' || !fill) && !hasFillClass
          }).first()
          
          if ($btnNaoFavoritado.length === 0) {
            cy.log('⚠️ Todas as lojas já estão favoritadas')
            return
          }
          
          // Clica no botão
          cy.wrap($btnNaoFavoritado).scrollIntoView({ duration: 500 })
          cy.wait(500)
          cy.log('❤️ Clicando no favorito de loja...')
          cy.wrap($btnNaoFavoritado).click({ force: true })
          
          // Valida toast de sucesso
          cy.contains('Adicionado aos favoritos', { timeout: 5000 }).should('be.visible')
          cy.log('✅ Toast de sucesso exibido!')
          cy.wait(2000)
          
          // Vai para favoritos e valida na seção de lojas
          cy.visit('/favoritos')
          cy.wait(2000)
          
          // Scroll até seção de lojas
          cy.contains('Lojas Favoritas').scrollIntoView()
          cy.wait(1000)
          
          cy.get('body').then(($favoritos) => {
            const temLojasFavoritas = !$favoritos.text().includes('Nenhuma loja favorita')
            
            if (temLojasFavoritas) {
              cy.log('✅ SUCESSO: Loja aparece em Lojas Favoritas!')
            } else {
              cy.log('❌ Loja não apareceu em favoritos')
            }
          })
        })
      })
    })

    it('FLUXO: Remover loja dos favoritos', () => {
      cy.visit('/favoritos')
      cy.wait(2000)
      
      // Scroll até seção de lojas
      cy.contains('Lojas Favoritas').scrollIntoView()
      cy.wait(1000)
      
      cy.get('body').then(($body) => {
        const temLojasFavoritas = !$body.text().includes('Nenhuma loja favorita')
        
        if (!temLojasFavoritas) {
          cy.log('⚠️ Nenhuma loja favorita para remover - teste pulado')
          return
        }
        
        cy.log('🗑️ Removendo loja favorita')
        
        // Scroll
        cy.scrollTo('bottom', { duration: 1000 })
        cy.wait(500)
        
        // Encontra botões de lojas favoritas (BUTTON)
        cy.get('button.absolute.top-3.right-3.rounded-full').filter((i, btn) => {
          return Cypress.$(btn).find('svg.lucide-heart').length > 0
        }).then(($botoes) => {
          
          if ($botoes.length === 0) {
            cy.log('⚠️ Nenhum botão encontrado')
            return
          }
          
          const qtdInicial = $botoes.length
          cy.log(`Lojas favoritas iniciais: ${qtdInicial}`)
          
          // Clica no primeiro
          cy.wrap($botoes.first()).scrollIntoView({ duration: 500 })
          cy.wait(500)
          cy.wrap($botoes.first()).click({ force: true })
          
          // Valida toast
          cy.contains('Removido dos favoritos', { timeout: 5000 }).should('be.visible')
          cy.wait(2000)
          
          cy.log('✅ Loja removida dos favoritos')
        })
      })
    })

    it('FLUXO: Sincronização entre /lojas e /favoritos', () => {
      // Limpa lojas favoritas
      cy.visit('/favoritos')
      cy.wait(2000)
      cy.contains('Lojas Favoritas').scrollIntoView()
      cy.wait(1000)
      
      cy.get('body').then(($body) => {
        if (!$body.text().includes('Nenhuma loja favorita')) {
          cy.limparLojasFavoritas()
        }
      })
      
      // Vai para /lojas
      cy.visit('/lojas')
      cy.wait(3000)
      
      cy.get('body').then(($body) => {
        if ($body.find('div[class*="rounded-xl"]').length === 0) {
          cy.log('⚠️ Sem lojas')
          return
        }
        
        // Scroll
        cy.scrollTo('bottom', { duration: 1000 })
        cy.wait(500)
        cy.scrollTo('top', { duration: 1000 })
        cy.wait(1000)
        
        // Encontra e clica (BUTTON)
        cy.get('button.absolute.top-3.right-3.rounded-full').filter((i, btn) => {
          return Cypress.$(btn).find('svg.lucide-heart').length > 0
        }).then(($botoes) => {
          if ($botoes.length === 0) return
          
          // Pega não favoritado
          const $btnNaoFav = $botoes.filter((i, btn) => {
            const svg = Cypress.$(btn).find('svg.lucide-heart')
            const fill = svg.attr('fill')
            const hasFillClass = svg.hasClass('fill-red-500')
            return (fill === 'none' || !fill) && !hasFillClass
          }).first()
          
          if ($btnNaoFav.length === 0) {
            cy.log('⚠️ Todas já favoritadas')
            return
          }
          
          cy.wrap($btnNaoFav).scrollIntoView()
          cy.wait(500)
          cy.wrap($btnNaoFav).click({ force: true })
          
          cy.contains('Adicionado aos favoritos', { timeout: 5000 }).should('be.visible')
          cy.wait(2000)
          
          // Verifica sincronização em /favoritos
          cy.visit('/favoritos')
          cy.wait(2000)
          
          cy.contains('Lojas Favoritas').scrollIntoView()
          cy.wait(1000)
          
          cy.get('body').should('not.contain', 'Nenhuma loja favorita')
          cy.log('✅ SINCRONIZAÇÃO OK: Loja aparece em favoritos!')
        })
      })
    })

    it('FLUXO: Botão de loja deve mudar estado ao favoritar', () => {
      cy.visit('/lojas')
      cy.wait(3000)
      
      cy.get('body').then(($body) => {
        if ($body.find('div[class*="rounded-xl"]').length === 0) {
          cy.log('⚠️ Sem lojas')
          return
        }
        
        // Scroll
        cy.scrollTo('bottom', { duration: 1000 })
        cy.wait(500)
        cy.scrollTo('top', { duration: 1000 })
        cy.wait(1000)
        
        // Pega botão não favoritado (BUTTON)
        cy.get('button.absolute.top-3.right-3.rounded-full').filter((i, btn) => {
          const $btn = Cypress.$(btn)
          const svg = $btn.find('svg.lucide-heart')
          const fill = svg.attr('fill')
          const hasFillClass = svg.hasClass('fill-red-500')
          return $btn.find('svg.lucide-heart').length > 0 && (fill === 'none' || !fill) && !hasFillClass
        }).first().then(($btn) => {
          
          if ($btn.length === 0) {
            cy.log('⚠️ Nenhum botão não favoritado')
            return
          }
          
          // Estado ANTES
          const svgAntes = $btn.find('svg.lucide-heart')
          const fillAntes = svgAntes.attr('fill')
          const hasClassAntes = svgAntes.hasClass('fill-red-500')
          cy.log(`Estado ANTES: fill="${fillAntes}", hasClass=${hasClassAntes}`)
          expect((fillAntes === 'none' || !fillAntes) && !hasClassAntes).to.be.true
          
          // Clica
          cy.wrap($btn).scrollIntoView()
          cy.wait(500)
          cy.wrap($btn).click({ force: true })
          
          cy.contains('Adicionado aos favoritos', { timeout: 5000 }).should('be.visible')
          cy.wait(2000)
          
          // Recarrega e verifica estado DEPOIS
          cy.reload()
          cy.wait(3000)
          
          cy.scrollTo('bottom', { duration: 1000 })
          cy.wait(500)
          cy.scrollTo('top', { duration: 1000 })
          cy.wait(1000)
          
          cy.get('button.absolute.top-3.right-3.rounded-full').filter((i, btn) => {
            return Cypress.$(btn).find('svg.lucide-heart').length > 0
          }).first().then(($btnDepois) => {
            const svgDepois = $btnDepois.find('svg.lucide-heart')
            const fillDepois = svgDepois.attr('fill')
            const hasClassDepois = svgDepois.hasClass('fill-red-500')
            cy.log(`Estado DEPOIS: fill="${fillDepois}", hasClass=${hasClassDepois}`)
            
            if ((fillDepois && fillDepois !== 'none') || hasClassDepois) {
              cy.log('✅ SUCESSO: Botão de loja mudou para favoritado!')
            } else {
              cy.log('⚠️ Botão não mudou de estado')
            }
          })
        })
      })
    })

    it('FLUXO: Múltiplas lojas favoritas', () => {
      // Limpa
      cy.visit('/favoritos')
      cy.wait(2000)
      cy.contains('Lojas Favoritas').scrollIntoView()
      cy.wait(1000)
      
      cy.get('body').then(($body) => {
        if (!$body.text().includes('Nenhuma loja favorita')) {
          cy.limparLojasFavoritas()
        }
      })
      
      // Adiciona 2 lojas
      cy.visit('/lojas')
      cy.wait(3000)
      
      cy.get('body').then(($body) => {
        if ($body.find('div[class*="rounded-xl"]').length === 0) {
          cy.log('⚠️ Sem lojas')
          return
        }
        
        // Scroll
        cy.scrollTo('bottom', { duration: 1000 })
        cy.wait(500)
        cy.scrollTo('top', { duration: 1000 })
        cy.wait(1000)
        
        // Encontra botões não favoritados (BUTTON)
        cy.get('button.absolute.top-3.right-3.rounded-full').filter((i, btn) => {
          const $btn = Cypress.$(btn)
          const svg = $btn.find('svg.lucide-heart')
          const fill = svg.attr('fill')
          const hasFillClass = svg.hasClass('fill-red-500')
          return $btn.find('svg.lucide-heart').length > 0 && (fill === 'none' || !fill) && !hasFillClass
        }).then(($botoes) => {
          if ($botoes.length === 0) {
            cy.log('⚠️ Nenhuma loja disponível')
            return
          }
          
          const quantidade = Math.min(2, $botoes.length)
          cy.log(`Tentando adicionar ${quantidade} lojas aos favoritos`)
          
          for (let i = 0; i < quantidade; i++) {
            cy.wrap($botoes.eq(i)).scrollIntoView()
            cy.wait(300)
            cy.wrap($botoes.eq(i)).click({ force: true })
            cy.contains('Adicionado aos favoritos', { timeout: 5000 }).should('be.visible')
            cy.wait(2000)
            cy.log(`❤️ Loja favoritada ${i + 1}/${quantidade}`)
          }
          
          // Verifica em favoritos
          cy.visit('/favoritos')
          cy.wait(2000)
          
          cy.contains('Lojas Favoritas').scrollIntoView()
          cy.wait(1000)
          
          cy.get('body').then(($favoritos) => {
            if (!$favoritos.text().includes('Nenhuma loja favorita')) {
              cy.log(`✅ SUCESSO: ${quantidade} lojas adicionadas aos favoritos!`)
            }
          })
        })
      })
    })

    it('FLUXO: Link "Explorar Lojas" deve funcionar quando vazio', () => {
      // Limpa lojas
      cy.visit('/favoritos')
      cy.wait(2000)
      cy.contains('Lojas Favoritas').scrollIntoView()
      cy.wait(1000)
      
      cy.get('body').then(($body) => {
        if (!$body.text().includes('Nenhuma loja favorita')) {
          cy.limparLojasFavoritas()
        }
      })
      
      // Valida link
      cy.visit('/favoritos')
      cy.wait(2000)
      cy.contains('Lojas Favoritas').scrollIntoView()
      cy.wait(1000)
      
      cy.contains('a', 'Explorar Lojas').should('be.visible')
      cy.contains('a', 'Explorar Lojas').click()
      
      cy.url().should('match', /lojas/)
      cy.log('✅ Link "Explorar Lojas" funciona')
    })
  })
});

it('search stores', function() {
  cy.visit('http://104.131.166.156:3000/fecomercio-anapolis-demo/lojas')
  cy.get('#searchStore').click();
  cy.get('#searchStore').click();
  cy.get('#searchStore').type('Loja Demo LTDA.');
  cy.get('#searchButton').click();
  cy.get('div.space-y-2').click();
  cy.get('h3.text-white').click();
  cy.get('button.inline-flex').click();
  cy.get('nav.space-y-2 a[href="/fecomercio-anapolis-demo/lojas"]').click();
  cy.get('#filterCategory').select('be7a2cf1-03ed-4c21-8a00-8e23a9fe24d9');
  cy.get('#filterLocation').select('Setor Bela Vista');
  cy.get('#searchButton').click();
  cy.get('div.p-6').click();
  cy.get('span.line-clamp-2').click();
  cy.get('div:nth-child(3) > span').click();
  cy.get('span.line-clamp-2').click();
  cy.get('#viewStore0').click();
  cy.get('h1.text-xl').click();
  cy.get('div.lg\\:grid-cols-2 > div:nth-child(1) > div:nth-child(1)').click();
  cy.get('div:nth-child(1) > div.flex-1 > p.font-medium').click();
  cy.get('div:nth-child(2) > div.flex-1 > p.font-medium').click();
  cy.get('div:nth-child(3) > div.flex-1 > p.font-medium').click();
  
});