/**
 * ============================================
 * PAGE OBJECT - BUSCA DE OFERTAS (HOME)
 * ============================================
 * Funcionalidade: Busca de ofertas no header da home
 */

class BuscaOfertasPage {
  // ============================================
  // ELEMENTOS
  // ============================================
  elements = {
    // Campo de busca DESKTOP (mais específico)
    campoBuscaDesktop: () => cy.get('div.max-w-2xl input[placeholder="Buscar ofertas..."]'),
    
    // Campo de busca MOBILE
    campoBuscaMobile: () => cy.get('.md\\:hidden input[placeholder="Buscar ofertas..."]'),
    
    // Campo de busca UNIVERSAL (pega o visível automaticamente)
    campoBusca: () => cy.get('input[placeholder="Buscar ofertas..."]').filter(':visible').first(),
    
    // Botão X para limpar busca
    // Como o SVG é clicável e funciona, usamos direto!
    // cy.get('svg.lucide-x').click() ✅
    botaoLimpar: () => cy.get('svg.lucide-x').filter(':visible').first(),
    
    // Dropdown de resultados
    dropdownResultados: () => cy.get('.absolute.z-50.mt-2.w-full'),
    
    // Itens de resultado (buttons dentro do dropdown)
    itemResultado: (index = 0) => cy.get('.absolute.z-50 button').eq(index),
    todosResultados: () => cy.get('.absolute.z-50 button'),
    
    // Elementos dentro de cada resultado
    imagemResultado: (index = 0) => cy.get('.absolute.z-50 button').eq(index).find('img'),
    tituloResultado: (index = 0) => cy.get('.absolute.z-50 button').eq(index).find('p.font-medium'),
    descricaoResultado: (index = 0) => cy.get('.absolute.z-50 button').eq(index).find('p.text-xs'),
    
    // Mensagem de sem resultados
    mensagemSemResultados: () => cy.contains('Nenhum resultado encontrado'),
    
    // Loading indicator
    loadingIndicator: () => cy.contains('Buscando sugestões'),
  }

  // ============================================
  // AÇÕES
  // ============================================

  /**
   * Digita no campo de busca (detecta automaticamente desktop/mobile)
   * @param {string} termo - Termo a buscar
   */
  buscar(termo) {
    // Aguarda campo estar visível
    this.elements.campoBusca().should('be.visible')
    
    // Digita o termo
    this.elements.campoBusca().type(termo)
  }

  /**
   * Digita e aguarda debounce
   * @param {string} termo - Termo a buscar
   * @param {number} debounceMs - Tempo de debounce (padrão 400ms)
   */
  buscarEAguardar(termo, debounceMs = 400) {
    this.buscar(termo)
    cy.wait(debounceMs)
  }

  /**
   * Digita no campo DESKTOP especificamente
   * @param {string} termo - Termo a buscar
   */
  buscarDesktop(termo) {
    this.elements.campoBuscaDesktop().should('be.visible').type(termo)
  }

  /**
   * Digita no campo MOBILE especificamente
   * @param {string} termo - Termo a buscar
   */
  buscarMobile(termo) {
    this.elements.campoBuscaMobile().should('be.visible').type(termo)
  }

  /**
   * Clica em um resultado específico
   * @param {number} index - Índice do resultado (0-based)
   */
  clicarResultado(index = 0) {
    this.elements.itemResultado(index).should('be.visible').click()
  }

  /**
   * Limpa o campo de busca manualmente
   */
  limparBusca() {
    this.elements.campoBusca().should('be.visible').clear()
  }

  /**
   * Clica no botão X para limpar (se existir)
   */
  clicarBotaoLimpar() {
    this.elements.botaoLimpar().should('be.visible').click()
  }

  /**
   * Pressiona Enter no campo de busca
   */
  pressionarEnter() {
    this.elements.campoBusca().should('be.visible').type('{enter}')
  }

  /**
   * Clica fora do dropdown para fechá-lo
   */
  clicarFora() {
    // Clica no logo (canto superior esquerdo)
    cy.get('body').click(100, 100)
  }

  // ============================================
  // VALIDAÇÕES
  // ============================================

  /**
   * Valida que dropdown está visível
   */
  validarDropdownVisivel() {
    this.elements.dropdownResultados().should('be.visible')
  }

  /**
   * Valida que dropdown está oculto/não existe
   */
  validarDropdownOculto() {
    this.elements.dropdownResultados().should('not.exist')
  }

  /**
   * Valida número de resultados
   * @param {number} quantidade - Quantidade esperada
   */
  validarQuantidadeResultados(quantidade) {
    this.elements.todosResultados().should('have.length', quantidade)
  }

  /**
   * Valida que tem ao menos N resultados
   * @param {number} minimo - Quantidade mínima
   */
  validarQuantidadeMinimaResultados(minimo) {
    this.elements.todosResultados().should('have.length.greaterThan', minimo - 1)
  }

  /**
   * Valida que resultado tem imagem
   * @param {number} index - Índice do resultado
   */
  validarResultadoTemImagem(index = 0) {
    this.elements.imagemResultado(index).should('be.visible')
    this.elements.imagemResultado(index).should('have.attr', 'src')
    this.elements.imagemResultado(index).should('have.attr', 'alt')
  }

  /**
   * Valida que resultado tem título
   * @param {number} index - Índice do resultado
   * @param {string} textoEsperado - Texto esperado (opcional, faz contains)
   */
  validarResultadoTemTitulo(index = 0, textoEsperado = null) {
    this.elements.tituloResultado(index).should('be.visible')
    
    if (textoEsperado) {
      this.elements.tituloResultado(index).should('contain', textoEsperado)
    }
  }

  /**
   * Valida que resultado tem descrição (quando aplicável)
   * @param {number} index - Índice do resultado
   */
  validarResultadoTemDescricao(index = 0) {
    this.elements.descricaoResultado(index).should('be.visible')
  }

  /**
   * Valida mensagem de sem resultados
   */
  validarMensagemSemResultados() {
    this.validarDropdownVisivel()
    this.elements.mensagemSemResultados().should('be.visible')
  }

  /**
   * Valida que loading está visível
   */
  validarLoadingVisivel() {
    this.elements.loadingIndicator().should('be.visible')
  }

  /**
   * Valida que loading desapareceu
   */
  validarLoadingOculto() {
    this.elements.loadingIndicator().should('not.exist')
  }

  /**
   * Valida estrutura completa de um resultado
   * @param {number} index - Índice do resultado
   */
  validarEstruturaResultado(index = 0) {
    cy.log(`📋 Validando estrutura do resultado ${index}`)
    
    // Resultado é clicável
    this.elements.itemResultado(index).should('be.visible')
    
    // Imagem
    this.validarResultadoTemImagem(index)
    
    // Título
    this.validarResultadoTemTitulo(index)
  }

  /**
   * Valida que navegou para página de oferta
   */
  validarNavegacaoOferta() {
    cy.url().should('include', '/oferta/detalhes/')
  }

  /**
   * Valida que navegou para página de pesquisa/resultados
   */
  validarNavegacaoPesquisa() {
    cy.url().should('include', '/cliente/pesquisa')
  }

  /**
   * Valida que campo de busca está vazio
   */
  validarCampoVazio() {
    this.elements.campoBusca().should('have.value', '')
  }

  /**
   * Valida que campo contém texto
   * @param {string} texto - Texto esperado
   */
  validarCampoContemTexto(texto) {
    this.elements.campoBusca().should('have.value', texto)
  }

  // ============================================
  // HELPERS
  // ============================================

  /**
   * Aguarda um tempo específico
   * @param {number} ms - Milissegundos
   */
  aguardar(ms) {
    cy.wait(ms)
  }

  /**
   * Intercepta chamada de API de busca
   * @param {string} alias - Alias para o intercept (padrão: 'buscaOfertas')
   */
  interceptarBuscaAPI(alias = 'buscaOfertas') {
    cy.intercept('GET', '**/api/v1/marketplace/**/search?q=*').as(alias)
  }

  /**
   * Aguarda resposta da API
   * @param {string} alias - Alias do intercept (padrão: 'buscaOfertas')
   */
  aguardarBuscaAPI(alias = 'buscaOfertas') {
    cy.wait(`@${alias}`)
  }

  /**
   * Coleta títulos de todos os resultados
   * @returns {Promise<string[]>} Array com os títulos
   */
  coletarTitulosResultados() {
    const titulos = []
    return this.elements.todosResultados().each(($el) => {
      titulos.push($el.find('p.font-medium').text().trim())
    }).then(() => titulos)
  }

  /**
   * Detecta se está em mobile ou desktop
   * @returns {boolean} true se mobile, false se desktop
   */
  isMobile() {
    return cy.viewport().then((viewport) => {
      return viewport.viewportWidth < 768
    })
  }
}

export default new BuscaOfertasPage()