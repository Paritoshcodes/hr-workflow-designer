import type { SerializedWorkflow, WorkflowEdge, WorkflowNode } from '@/types/workflow'

export function serializeWorkflow(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  name: string
): SerializedWorkflow {
  const now = new Date().toISOString()

  return {
    metadata: {
      name,
      description: 'HR workflow export',
      version: '1.0',
      createdAt: now,
      updatedAt: now,
    },
    nodes,
    edges,
  }
}

export function deserializeWorkflow(json: unknown): Pick<SerializedWorkflow, 'nodes' | 'edges'> {
  if (typeof json !== 'object' || json === null) {
    throw new Error('Invalid workflow: not an object')
  }

  const value = json as Record<string, unknown>

  if (!Array.isArray(value.nodes)) {
    throw new Error('Invalid workflow: missing nodes array')
  }

  if (!Array.isArray(value.edges)) {
    throw new Error('Invalid workflow: missing edges array')
  }

  for (const node of value.nodes as WorkflowNode[]) {
    if (!node.id) {
      throw new Error('Invalid node: missing id')
    }

    if (!node.type) {
      throw new Error(`Invalid node ${node.id}: missing type`)
    }

    if (!node.data) {
      throw new Error(`Invalid node ${node.id}: missing data`)
    }

    if (!node.position) {
      throw new Error(`Invalid node ${node.id}: missing position`)
    }
  }

  return {
    nodes: value.nodes as WorkflowNode[],
    edges: value.edges as WorkflowEdge[],
  }
}

export function downloadWorkflowJSON(workflow: SerializedWorkflow): void {
  const blob = new Blob([JSON.stringify(workflow, null, 2)], {
    type: 'application/json',
  })

  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${workflow.metadata.name.replace(/\s+/g, '-').toLowerCase()}.json`

  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}
