// Custom Cypress commands

// Visita a página de login do demo Fecomercio Anápolis
Cypress.Commands.add('visitLogin', () => {
    cy.visit('http://104.131.166.156:3000/fecomercio-anapolis-demo/login');
});

Cypress.Commands.add('loginSucesso', () => {
    const email = 'joao.silva@email.com';
    const senha = 'Senha@123';

    // Agora, com baseUrl, isso vai pra URL certa
    cy.visit('/login');

    cy.get('input[type="email"]').clear().type(email);
    cy.get('input[type="password"]').clear().type(senha, { log: false });
    cy.contains('button', 'Entrar').click();

    // Garante que logou mesmo
    cy.url({ timeout: 10000 }).should('include', '/home');
});

// Login como CLIENTE
Cypress.Commands.add('loginCliente', () => {
    cy.fixture('users').then((users) => {
        const { email, password } = users.cliente;

        cy.visit('/login');
        cy.get('input[type="email"]').clear().type(email);
        cy.get('input[type="password"]').clear().type(password, { log: false });
        cy.contains('button', 'Entrar').click();

        // aqui você valida alguma coisa da área do cliente
        cy.url().should('include', '/home'); // ajuste se for outra rota
    });
});

// Login como LOJISTA (que é o que interessa pro validar-cupom)
Cypress.Commands.add('loginLojista', () => {
    cy.fixture('users').then((users) => {
        const { email, password } = users.lojista;

        cy.visit('/login');
        cy.get('input[type="email"]').clear().type(email);
        cy.get('input[type="password"]').clear().type(password, { log: false });
        cy.contains('button', 'Entrar').click();

        // aqui valida que caiu no painel lojista
        cy.url().should('include', '/dashboard');
        // ou '/validar-cupom', '/dashboard-lojista', etc — coloca a rota certa
    });
});

Cypress.Commands.add('mockCupomValidate', () => {
    cy.intercept(
        'POST',
        '**/api/v1/coupons/validate',
        {
            statusCode: 201,
            body: {
                valid: true,
                message: 'Cupom validado com sucesso'
            }
        }
    ).as('postValidar');
});

// cypress/support/commands.js
Cypress.Commands.add('clearAllStoreImages', () => {
    // Buscar todas as imagens atuais usando URL absoluta (garante remoção do path do baseUrl)
    const listUrl = new URL('/api/v1/stores/me/showcase-images', Cypress.config('baseUrl')).toString();

    cy.request({
        method: 'GET',
        url: listUrl,
        failOnStatusCode: false
    }).then(response => {
        if (response.status === 200 && Array.isArray(response.body) && response.body.length > 0) {
            const total = response.body.length;
            // Deletar de trás para frente para não invalidar índices
            for (let i = total - 1; i >= 0; i--) {
                const deleteUrl = new URL(`/api/v1/stores/me/showcase-images/${i}`, Cypress.config('baseUrl')).toString();
                cy.request({
                    method: 'DELETE',
                    url: deleteUrl,
                    failOnStatusCode: false
                });
            }
        }
    });
});


Cypress.Commands.add('dragAndDrop', (source, target) => {
    const dataTransfer = new DataTransfer();

    // helper to wrap either a selector or an element
    const wrap = (thing) => {
        if (Cypress.dom.isJquery(thing) || thing instanceof Element) {
            return cy.wrap(thing);
        }
        return cy.get(thing);
    };

    wrap(source).then($src => {
        // start drag on source
        cy.wrap($src).trigger('dragstart', { dataTransfer });

        // ensure target receives dragenter/dragover before drop
        wrap(target).then($tgt => {
            cy.wrap($tgt)
                .trigger('dragenter', { dataTransfer, force: true })
                .trigger('dragover', { dataTransfer, force: true })
                .trigger('drop', { dataTransfer, force: true });
        });

        // finish drag
        cy.wrap($src).trigger('dragend', { dataTransfer, force: true });
    });
});





