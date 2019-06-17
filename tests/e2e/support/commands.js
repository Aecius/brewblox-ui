// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add('resetSpark', () => {
  cy.exec('npm run couchdb:docs');
  cy.exec('npm run spark:blocks');
});


ypress.Commands.add('MakeWidget', (type) => {
  // Look into making it check if the menu is open before clicking it.
  //  cy.contains('menu').click();
  cy.contains('Wizardry').click();
  cy.contains('Widget').click();

  cy.contains(/NEXT$/i).should('be.disabled');

  cy.get('.q-select__input').click();
  cy.contains(type).click();
  cy.contains(/NEXT$/i).click();

  cy.contains(/CREATE NEW BLOCK$/i).click();
  cy.wait(10);
});
