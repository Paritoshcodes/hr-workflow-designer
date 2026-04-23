import type { VercelRequest, VercelResponse } from '@vercel/node'

type NodeType = 'start' | 'task' | 'approval' | 'automated' | 'end'

type WorkflowNode = {
  id: string
  type: NodeType
  data?: Record<string, unknown>
}

type WorkflowEdge = {
  source: string
  target: string
}

interface SimulateBody {
  nodes?: WorkflowNode[]
  edges?: WorkflowEdge[]
}

function getLabel(node: WorkflowNode): string {
  const data = node.data ?? {}
  if (node.type === 'end') {
    return typeof data.endMessage === 'string' ? data.endMessage : 'Workflow completed'
  }

  return typeof data.title === 'string' ? data.title : 'Untitled step'
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  let body: unknown = req.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      res.status(400).json({ error: 'Invalid JSON body' })
      return
    }
  }

  if (!body || typeof body !== 'object') {
    res.status(400).json({ error: 'Invalid request body' })
    return
  }

  const { nodes, edges } = body as SimulateBody
  if (!Array.isArray(nodes) || !Array.isArray(edges)) {
    res.status(400).json({ error: 'Invalid workflow: missing nodes or edges' })
    return
  }

  const steps = nodes.map((node, index) => {
    const label = getLabel(node)
    return {
      step: index + 1,
      nodeId: node.id,
      label,
      status: 'completed' as const,
      message: `Processed ${label}`,
    }
  })

  res.status(200).json({ status: 'success', steps })
}
