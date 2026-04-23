describe('Canvas - Core Interactions', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.get('[data-cy="workflow-canvas"]').should('be.visible')
  })

  it('loads with an empty canvas', () => {
    cy.get('.react-flow__node').should('not.exist')
  })

  it('shows all node types in sidebar', () => {
    const types = ['start', 'task', 'approval', 'automated', 'end']

    types.forEach((type) => {
      cy.get(`[data-cy="sidebar-node-${type}"]`).should('be.visible')
    })
  })

  it('loads the onboarding template', () => {
    cy.loadTemplate('onboarding')
    cy.get('.react-flow__node').should('have.length', 6)
  })

  it('loads the leave-approval template', () => {
    cy.loadTemplate('leave-approval')
    cy.get('.react-flow__node').should('have.length', 6)
  })

  it('clears the canvas', () => {
    cy.loadTemplate('onboarding')
    cy.on('window:confirm', () => true)
    cy.get('button[aria-label="Clear canvas"]').click()
    cy.get('.react-flow__node').should('not.exist')
  })

  it('deletes a selected node with Delete key', () => {
    cy.loadTemplate('onboarding')
    cy.get('.react-flow__node').first().click()
    cy.get('.react-flow__node').then(($nodes) => {
      const initialCount = $nodes.length
      cy.get('body').type('{del}')
      cy.get('.react-flow__node').should('have.length', initialCount - 1)
    })
  })
})
