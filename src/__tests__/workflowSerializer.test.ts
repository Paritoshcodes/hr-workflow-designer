import { describe, expect, it } from 'vitest'
import type { WorkflowEdge, WorkflowNode } from '@/types/workflow'
import { deserializeWorkflow, serializeWorkflow } from '@/utils/workflowSerializer'

const mockNodes: WorkflowNode[] = [
  {
    id: '1',
    type: 'start',
    position: { x: 0, y: 0 },
    data: { type: 'start', title: 'Start', metadata: [] },
  },
  {
    id: '2',
    type: 'end',
    position: { x: 0, y: 120 },
    data: { type: 'end', endMessage: 'Done', showSummary: false },
  },
]

const mockEdges: WorkflowEdge[] = [{ id: 'e1', source: '1', target: '2' }]

describe('serializeWorkflow', () => {
  it('produces valid metadata structure', () => {
    const result = serializeWorkflow(mockNodes, mockEdges, 'Test Workflow')

    expect(result.metadata.name).toBe('Test Workflow')
    expect(result.metadata.version).toBe('1.0')
    expect(result.metadata.createdAt).toBeDefined()
    expect(result.metadata.updatedAt).toBeDefined()
  })

  it('includes nodes and edges', () => {
    const result = serializeWorkflow(mockNodes, mockEdges, 'Test')

    expect(result.nodes).toHaveLength(2)
    expect(result.edges).toHaveLength(1)
  })
})

describe('deserializeWorkflow', () => {
  it('deserializes valid workflow', () => {
    const input = {
      metadata: { name: 'test' },
      nodes: mockNodes,
      edges: mockEdges,
    }

    const result = deserializeWorkflow(input)
    expect(result.nodes).toHaveLength(2)
    expect(result.edges[0].source).toBe('1')
  })

  it('throws on null input', () => {
    expect(() => deserializeWorkflow(null)).toThrow('Invalid workflow: not an object')
  })

  it('throws when nodes missing', () => {
    expect(() => deserializeWorkflow({ nodes: 'bad', edges: [] })).toThrow(
      'Invalid workflow: missing nodes array'
    )
  })

  it('throws when edges missing', () => {
    expect(() => deserializeWorkflow({ nodes: [] })).toThrow('Invalid workflow: missing edges array')
  })

  it('throws when node missing id', () => {
    const badNodes = [{ type: 'start', position: { x: 0, y: 0 }, data: {} }]
    expect(() => deserializeWorkflow({ nodes: badNodes, edges: [] })).toThrow('missing id')
  })

  it('round-trips correctly', () => {
    const serialized = serializeWorkflow(mockNodes, mockEdges, 'Round Trip')
    const deserialized = deserializeWorkflow(serialized)

    expect(deserialized.nodes[0].id).toBe(mockNodes[0].id)
    expect(deserialized.edges[0].target).toBe(mockEdges[0].target)
  })
})