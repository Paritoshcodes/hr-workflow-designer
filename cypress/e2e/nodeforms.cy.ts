describe('Node Configuration Forms', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.loadTemplate('onboarding')
  })

  it('shows the form panel when a node is clicked', () => {
    cy.get('.react-flow__node').first().click()
    cy.get('[data-cy="node-form-panel"]').should('be.visible')
  })

  it('hides the form panel when clicking close', () => {
    cy.get('.react-flow__node').first().click()
    cy.get('[data-cy="node-form-panel"] button[aria-label="Close node form panel"]').click()
    cy.get('[data-cy="node-form-panel"]').should('not.exist')
  })

  it('updates a task node title from the form', () => {
    cy.contains('.react-flow__node', 'Collect Documents').click()
    cy.get('[data-cy="node-form-panel"] input[aria-label="Task title"]').clear().type('Updated Task Title')
    cy.contains('.react-flow__node', 'Updated Task Title').should('be.visible')
  })

  it('adds metadata in start node form', () => {
    cy.get('.react-flow__node[data-id="t1"]').click()
    cy.get('[data-cy="node-form-panel"] button[aria-label="Add metadata field"]').click()
    cy.get('[data-cy="node-form-panel"] input[placeholder="Key"]').should('exist')
  })

  it('loads automations in automated node form', () => {
    cy.get('.react-flow__node[data-id="t3"]').click()
    cy.get('[data-cy="node-form-panel"] button[aria-label="Automation action"]').click()
    cy.get('[data-cy="node-form-panel"] [role="listbox"]').should('contain.text', 'Generate Document')
  })

  it('toggles the summary flag in end node form', () => {
    cy.get('.react-flow__node[data-id="t6"]').click()
    cy.get('[data-cy="node-form-panel"] input[type="checkbox"]').click()
  })
})
