const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://104.131.166.156:3000/fecomercio-anapolis-demo',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    // Se o Cypress reclamar de cy.session, habilita isso:
    // experimentalSessionAndOrigin: true,
  },
});
