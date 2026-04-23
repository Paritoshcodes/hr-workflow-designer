/* eslint-disable @typescript-eslint/no-namespace */

Cypress.Commands.add('dragNodeToCanvas', (nodeType: string, x: number, y: number) => {
  const dataTransfer = new DataTransfer()

  cy.get(`[data-cy="sidebar-node-${nodeType}"]`).trigger('dragstart', { dataTransfer })
  cy.get('[data-cy="workflow-canvas"]').trigger('drop', {
    dataTransfer,
    clientX: x,
    clientY: y,
  })
})

Cypress.Commands.add('loadTemplate', (templateId: string) => {
  cy.get('[data-cy="sidebar-tab-templates"]').click()
  cy.get(`[data-cy="template-${templateId}"]`).click()
})

Cypress.Commands.add('waitForSimulation', () => {
  cy.get('[data-cy="btn-simulate"]').click()
  cy.get('[data-cy="simulation-log"]', { timeout: 15000 }).should('be.visible')
})

declare global {
  namespace Cypress {
    interface Chainable {
      dragNodeToCanvas(nodeType: string, x: number, y: number): Chainable<void>
      loadTemplate(templateId: string): Chainable<void>
      waitForSimulation(): Chainable<void>
    }
  }
}

export {}
