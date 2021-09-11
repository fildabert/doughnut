/// <reference types="cypress" />

Cypress.Commands.add('cleanDBAndSeedData', () => {
  cy.request({ method: 'POST', url: '/api/testability/clean_db_and_seed_data' })
    .its('body')
    .should('contain', 'OK');
});

Cypress.Commands.add('seedNotes', (notes, externalIdentifier = '') => {
  cy.request({
    method: 'POST',
    url: `/api/testability/seed_notes?external_identifier=${externalIdentifier}`,
    body: notes
  }).then(response => {
    expect(response.body.length).to.equal(notes.length);
    const titles = notes.map(n => n['title']);
    const noteMap = Object.assign(
      {},
      ...titles.map((t, index) => ({ [t]: response.body[index] }))
    );
    cy.wrap(noteMap).as('seededNoteIdMap');
  });
});

Cypress.Commands.add('timeTravelTo', (day, hour) => {
  const travelTo = new Date(1976, 5, 1, hour).addDays(day);
  cy.request({
    method: 'POST',
    url: '/api/testability/time_travel',
    body: { travel_to: JSON.stringify(travelTo) }
  })
    .its('status')
    .should('equal', 200);
});

Cypress.Commands.add('randomizerAlwaysChooseLast', (day, hour) => {
  cy.request({
    method: 'POST',
    url: '/api/testability/randomizer',
    body: { choose: 'last' }
  })
    .its('status')
    .should('equal', 200);
});