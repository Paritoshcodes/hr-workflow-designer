describe('Workflow Simulation', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('runs simulation on onboarding template', () => {
    cy.loadTemplate('onboarding')
    cy.waitForSimulation()
    cy.get('[data-cy="simulation-log"]').should('contain.text', 'Workflow initialized')
  })

  it('shows error when simulating empty canvas', () => {
    cy.get('[data-cy="btn-simulate"]').click()
    cy.get('[data-cy="simulation-log"]').should('contain.text', 'Cannot simulate')
  })

  it('runs simulation on leave approval template', () => {
    cy.loadTemplate('leave-approval')
    cy.waitForSimulation()
    cy.get('[data-cy="simulation-log"]').should('contain.text', 'Workflow completed')
  })

  it('export button is clickable after loading template', () => {
    cy.loadTemplate('onboarding')
    cy.get('[data-cy="btn-export"]').click()
  })
})
