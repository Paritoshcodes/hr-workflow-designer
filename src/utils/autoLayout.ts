import dagre from 'dagre'
import type { WorkflowEdge, WorkflowNode } from '@/types/workflow'

const NODE_WIDTH = 220
const NODE_HEIGHT = 90

export function applyDagreLayout(nodes: WorkflowNode[], edges: WorkflowEdge[]): WorkflowNode[] {
  const graph = new dagre.graphlib.Graph()
  graph.setDefaultEdgeLabel(() => ({}))
  graph.setGraph({ rankdir: 'TB', nodesep: 80, ranksep: 110 })

  nodes.forEach((node) => {
    graph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
  })

  edges.forEach((edge) => {
    graph.setEdge(edge.source, edge.target)
  })

  dagre.layout(graph)

  return nodes.map((node) => {
    const position = graph.node(node.id)
    return {
      ...node,
      style: {
        ...(node.style ?? {}),
        width: NODE_WIDTH,
      },
      position: {
        x: position.x - NODE_WIDTH / 2,
        y: position.y - NODE_HEIGHT / 2,
      },
    }
  })
}
