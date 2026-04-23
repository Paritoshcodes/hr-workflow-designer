import type {
  NodeColor,
  ValidationError,
  ValidationResult,
  WorkflowEdge,
  WorkflowNode,
} from '@/types/workflow'

type AdjacencyList = Map<string, string[]>
type ReverseAdjacencyList = Map<string, string[]>

function buildAdjacencyLists(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): { adj: AdjacencyList; radj: ReverseAdjacencyList } {
  const adj: AdjacencyList = new Map()
  const radj: ReverseAdjacencyList = new Map()

  for (const node of nodes) {
    adj.set(node.id, [])
    radj.set(node.id, [])
  }

  for (const edge of edges) {
    adj.get(edge.source)?.push(edge.target)
    radj.get(edge.target)?.push(edge.source)
  }

  return { adj, radj }
}

export function hasCycle(nodes: WorkflowNode[], edges: WorkflowEdge[]): boolean {
  const { adj } = buildAdjacencyLists(nodes, edges)
  const color = new Map<string, NodeColor>()

  for (const node of nodes) {
    color.set(node.id, 'WHITE')
  }

  const dfs = (nodeId: string): boolean => {
    color.set(nodeId, 'GRAY')
    const neighbors = adj.get(nodeId) ?? []

    for (const neighbor of neighbors) {
      const neighborColor = color.get(neighbor)
      if (neighborColor === 'GRAY') {
        return true
      }

      if (neighborColor === 'WHITE' && dfs(neighbor)) {
        return true
      }
    }

    color.set(nodeId, 'BLACK')
    return false
  }

  for (const node of nodes) {
    if (color.get(node.id) === 'WHITE' && dfs(node.id)) {
      return true
    }
  }

  return false
}

export function topologicalSort(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): WorkflowNode[] | null {
  const { adj } = buildAdjacencyLists(nodes, edges)
  const inDegree = new Map<string, number>()
  const nodeMap = new Map<string, WorkflowNode>()

  for (const node of nodes) {
    inDegree.set(node.id, 0)
    nodeMap.set(node.id, node)
  }

  for (const edge of edges) {
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1)
  }

  const queue: string[] = []
  for (const [id, degree] of inDegree.entries()) {
    if (degree === 0) {
      queue.push(id)
    }
  }

  const sorted: WorkflowNode[] = []

  while (queue.length > 0) {
    const current = queue.shift()
    if (!current) {
      continue
    }

    const node = nodeMap.get(current)
    if (node) {
      sorted.push(node)
    }

    for (const neighbor of adj.get(current) ?? []) {
      const nextDegree = (inDegree.get(neighbor) ?? 1) - 1
      inDegree.set(neighbor, nextDegree)
      if (nextDegree === 0) {
        queue.push(neighbor)
      }
    }
  }

  return sorted.length === nodes.length ? sorted : null
}

export function findReachableNodes(
  startId: string,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): Set<string> {
  const { adj } = buildAdjacencyLists(nodes, edges)
  const nodeIds = new Set(nodes.map((node) => node.id))
  if (!nodeIds.has(startId)) {
    return new Set()
  }

  const visited = new Set<string>()
  const queue = [startId]

  while (queue.length > 0) {
    const current = queue.shift()
    if (!current || visited.has(current)) {
      continue
    }

    visited.add(current)

    for (const neighbor of adj.get(current) ?? []) {
      if (!visited.has(neighbor)) {
        queue.push(neighbor)
      }
    }
  }

  return visited
}

export function validateWorkflow(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []

  if (nodes.length === 0) {
    errors.push({
      nodeId: null,
      code: 'EMPTY_CANVAS',
      message: 'Canvas is empty. Add at least one start and one end node.',
      severity: 'error',
    })

    return { isValid: false, errors, warnings }
  }

  const { adj, radj } = buildAdjacencyLists(nodes, edges)
  const startNodes = nodes.filter((node) => node.data.type === 'start')
  const endNodes = nodes.filter((node) => node.data.type === 'end')

  if (startNodes.length === 0) {
    errors.push({
      nodeId: null,
      code: 'MISSING_START_NODE',
      message: 'Workflow must contain exactly one start node.',
      severity: 'error',
    })
  } else if (startNodes.length > 1) {
    for (const node of startNodes) {
      errors.push({
        nodeId: node.id,
        code: 'MULTIPLE_START_NODES',
        message: 'Only one start node is allowed.',
        severity: 'error',
      })
    }
  }

  if (endNodes.length === 0) {
    errors.push({
      nodeId: null,
      code: 'MISSING_END_NODE',
      message: 'Workflow must contain at least one end node.',
      severity: 'error',
    })
  }

  for (const node of nodes) {
    const outgoing = adj.get(node.id) ?? []
    const incoming = radj.get(node.id) ?? []

    if (node.data.type !== 'end' && outgoing.length === 0) {
      errors.push({
        nodeId: node.id,
        code: 'NO_OUTGOING_EDGE',
        message: 'This node must connect to at least one next step.',
        severity: 'error',
      })
    }

    if (node.data.type !== 'start' && incoming.length === 0) {
      errors.push({
        nodeId: node.id,
        code: 'NO_INCOMING_EDGE',
        message: 'This node must have at least one incoming connection.',
        severity: 'error',
      })
    }
  }

  if (hasCycle(nodes, edges)) {
    errors.push({
      nodeId: null,
      code: 'CYCLE_DETECTED',
      message: 'Workflow contains a cycle. Remove looped connections.',
      severity: 'error',
    })
  }

  if (startNodes.length === 1) {
    const reachable = findReachableNodes(startNodes[0].id, nodes, edges)
    for (const node of nodes) {
      if (!reachable.has(node.id) && node.data.type !== 'start') {
        warnings.push({
          nodeId: node.id,
          code: 'DISCONNECTED_NODE',
          message: 'This node is disconnected from the start path.',
          severity: 'warning',
        })
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}
