import { describe, expect, it } from 'vitest'
import type { NodeType, WorkflowEdge, WorkflowNode } from '@/types/workflow'
import {
  findReachableNodes,
  hasCycle,
  topologicalSort,
  validateWorkflow,
} from '@/utils/graphTraversal'

function makeNode(id: string, type: NodeType): WorkflowNode {
  const base = {
    id,
    type,
    position: { x: 0, y: 0 },
  }

  switch (type) {
    case 'start':
      return { ...base, data: { type: 'start', title: `Node ${id}`, metadata: [] } }
    case 'task':
      return {
        ...base,
        data: {
          type: 'task',
          title: `Node ${id}`,
          description: '',
          assignee: '',
          dueDate: '',
          customFields: [],
        },
      }
    case 'approval':
      return {
        ...base,
        data: {
          type: 'approval',
          title: `Node ${id}`,
          approverRole: 'Manager',
          autoApproveThreshold: 0,
        },
      }
    case 'automated':
      return {
        ...base,
        data: {
          type: 'automated',
          title: `Node ${id}`,
          actionId: '',
          actionParams: {},
        },
      }
    case 'end':
      return {
        ...base,
        data: {
          type: 'end',
          endMessage: `Node ${id}`,
          showSummary: false,
        },
      }
  }
}

function makeEdge(source: string, target: string): WorkflowEdge {
  return { id: `e-${source}-${target}`, source, target }
}

describe('hasCycle', () => {
  it('returns false for linear graph', () => {
    const nodes = [makeNode('1', 'start'), makeNode('2', 'task'), makeNode('3', 'end')]
    const edges = [makeEdge('1', '2'), makeEdge('2', '3')]
    expect(hasCycle(nodes, edges)).toBe(false)
  })

  it('returns true for cycle', () => {
    const nodes = [makeNode('1', 'task'), makeNode('2', 'approval')]
    const edges = [makeEdge('1', '2'), makeEdge('2', '1')]
    expect(hasCycle(nodes, edges)).toBe(true)
  })
})

describe('topologicalSort', () => {
  it('sorts linear graph', () => {
    const nodes = [makeNode('1', 'start'), makeNode('2', 'task'), makeNode('3', 'end')]
    const edges = [makeEdge('1', '2'), makeEdge('2', '3')]
    const sorted = topologicalSort(nodes, edges)

    expect(sorted).not.toBeNull()
    expect(sorted?.map((node) => node.id)).toEqual(['1', '2', '3'])
  })

  it('returns null for cycle', () => {
    const nodes = [makeNode('1', 'task'), makeNode('2', 'task')]
    const edges = [makeEdge('1', '2'), makeEdge('2', '1')]
    expect(topologicalSort(nodes, edges)).toBeNull()
  })
})

describe('findReachableNodes', () => {
  it('finds reachable nodes from start', () => {
    const nodes = [
      makeNode('1', 'start'),
      makeNode('2', 'task'),
      makeNode('3', 'end'),
      makeNode('4', 'task'),
    ]
    const edges = [makeEdge('1', '2'), makeEdge('2', '3')]

    const reachable = findReachableNodes('1', nodes, edges)
    expect(reachable).toEqual(new Set(['1', '2', '3']))
  })
})

describe('validateWorkflow', () => {
  it('returns valid for basic linear workflow', () => {
    const nodes = [makeNode('1', 'start'), makeNode('2', 'task'), makeNode('3', 'end')]
    const edges = [makeEdge('1', '2'), makeEdge('2', '3')]

    const result = validateWorkflow(nodes, edges)
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('returns empty canvas error', () => {
    const result = validateWorkflow([], [])
    expect(result.isValid).toBe(false)
    expect(result.errors[0].code).toBe('EMPTY_CANVAS')
  })

  it('returns missing start error', () => {
    const result = validateWorkflow([makeNode('1', 'task'), makeNode('2', 'end')], [makeEdge('1', '2')])
    expect(result.errors.some((error) => error.code === 'MISSING_START_NODE')).toBe(true)
  })

  it('returns warning for disconnected node', () => {
    const nodes = [
      makeNode('1', 'start'),
      makeNode('2', 'task'),
      makeNode('3', 'task'),
      makeNode('4', 'end'),
    ]
    const edges = [makeEdge('1', '2'), makeEdge('2', '4')]

    const result = validateWorkflow(nodes, edges)
    expect(result.warnings.some((warning) => warning.code === 'DISCONNECTED_NODE')).toBe(true)
  })
})
