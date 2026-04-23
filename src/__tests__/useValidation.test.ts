import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useValidation } from '@/hooks/useValidation'
import { useWorkflowStore } from '@/store/workflowStore'
import type { WorkflowEdge, WorkflowNode } from '@/types/workflow'

const nodes: WorkflowNode[] = [
  {
    id: '1',
    type: 'start',
    position: { x: 0, y: 0 },
    data: { type: 'start', title: 'Start', metadata: [] },
  },
  {
    id: '2',
    type: 'task',
    position: { x: 0, y: 120 },
    data: {
      type: 'task',
      title: 'Task',
      description: '',
      assignee: '',
      dueDate: '',
      customFields: [],
    },
  },
  {
    id: '3',
    type: 'end',
    position: { x: 0, y: 240 },
    data: { type: 'end', endMessage: 'Done', showSummary: true },
  },
]

const edges: WorkflowEdge[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
]

describe('useValidation', () => {
  beforeEach(() => {
    act(() => {
      useWorkflowStore.getState().clearWorkflow()
      useWorkflowStore.getState().loadWorkflow({ nodes, edges })
    })
  })

  it('returns valid result for valid graph', () => {
    const { result } = renderHook(() => useValidation())

    act(() => {
      result.current.validate()
    })

    expect(result.current.validationResult?.isValid).toBe(true)
    expect(result.current.hasNodeError('2')).toBe(false)
  })

  it('returns node errors for disconnected node', () => {
    act(() => {
      useWorkflowStore.getState().loadWorkflow({
        nodes: [...nodes, { ...nodes[1], id: '4' }],
        edges,
      })
    })

    const { result } = renderHook(() => useValidation())

    act(() => {
      result.current.validate()
    })

    expect(result.current.getNodeErrors('4').length).toBeGreaterThan(0)
  })
})
