import { delay, http, HttpResponse } from 'msw'
import { topologicalSort } from '@/utils/graphTraversal'
import type { NodeType, SerializedWorkflow, SimulationStep } from '@/types/workflow'

const AUTOMATIONS = [
  { id: 'send_email', label: 'Send Email', params: ['to', 'subject', 'body'] },
  { id: 'generate_doc', label: 'Generate Document', params: ['template', 'recipient'] },
  { id: 'slack_notify', label: 'Slack Notification', params: ['channel', 'message'] },
  { id: 'create_ticket', label: 'Create JIRA Ticket', params: ['project', 'summary', 'assignee'] },
  { id: 'send_sms', label: 'Send SMS', params: ['phone', 'message'] },
  { id: 'update_hris', label: 'Update HRIS Record', params: ['employeeId', 'field', 'value'] },
]

const DURATION_BY_TYPE: Record<NodeType, () => number> = {
  start: () => 50 + Math.random() * 100,
  task: () => 600 + Math.random() * 800,
  approval: () => 900 + Math.random() * 1200,
  automated: () => 200 + Math.random() * 400,
  end: () => 50 + Math.random() * 100,
}

function getStepMessage(type: NodeType, title: string): string {
  const messages: Record<NodeType, string> = {
    start: `Workflow initialized: "${title}"`,
    task: `Task assigned and pending completion: "${title}"`,
    approval: `Approval request sent: "${title}"`,
    automated: `Executing automation: "${title}"`,
    end: `Workflow completed: "${title}"`,
  }

  return messages[type]
}

export const handlers = [
  http.get('/automations', async () => {
    await delay(120)
    return HttpResponse.json(AUTOMATIONS)
  }),

  http.post('/simulate', async ({ request }) => {
    await delay(300)

    const body = (await request.json()) as SerializedWorkflow
    const { nodes, edges } = body

    if (!nodes || !edges) {
      return HttpResponse.json(
        { success: false, error: 'Invalid workflow: missing nodes or edges' },
        { status: 400 }
      )
    }

    const sortedNodes = topologicalSort(nodes, edges)
    if (!sortedNodes) {
      return HttpResponse.json(
        { success: false, error: 'Workflow contains a cycle and cannot be executed' },
        { status: 422 }
      )
    }

    const steps: SimulationStep[] = sortedNodes.map((node) => {
      const nodeType = node.type as NodeType
      const title = node.data.type === 'end' ? node.data.endMessage : node.data.title
      const durationMs = Math.round((DURATION_BY_TYPE[nodeType] ?? (() => 300))())

      return {
        nodeId: node.id,
        nodeTitle: title,
        nodeType,
        status: 'completed',
        message: getStepMessage(nodeType, title),
        timestamp: new Date().toISOString(),
        durationMs,
      }
    })

    const totalDurationMs = steps.reduce((sum, step) => sum + step.durationMs, 0)

    return HttpResponse.json({
      success: true,
      steps,
      totalDurationMs,
    })
  }),

  http.post('/api/ai/suggestions', async () => {
    await delay(500)
    return HttpResponse.json({
      suggestions: [
        {
          nodeType: 'approval',
          title: 'Manager Approval',
          reason: 'Manager sign-off usually follows document collection or task completion',
        },
        {
          nodeType: 'automated',
          title: 'Send Notification',
          reason: 'Stakeholders should be notified of progress at each milestone',
        },
        {
          nodeType: 'task',
          title: 'Review & Verify',
          reason: 'A verification step ensures data quality before proceeding',
        },
      ],
    })
  }),

  http.post('/api/ai/critique', async () => {
    await delay(800)
    return HttpResponse.json({
      overallScore: 72,
      issues: [
        {
          nodeId: '',
          severity: 'warning',
          message: 'Consider adding an automated notification step to keep stakeholders informed',
        },
        {
          nodeId: '',
          severity: 'suggestion',
          message: 'Adding a parallel approval path would improve throughput for time-sensitive workflows',
        },
      ],
      summary: 'This workflow covers the core steps but could benefit from additional notification and error-handling mechanisms. The overall structure is sound, but adding communication touchpoints would improve the employee experience.',
    })
  }),

  http.post('/api/ai/narrate', async () => {
    await delay(300)
    return HttpResponse.json({
      narrative: 'The workflow executed successfully, starting with initialization and proceeding through each step in order. All tasks were completed within expected timeframes, and approvals were processed promptly. The automated steps executed efficiently, and the workflow concluded with a successful completion message.',
    })
  }),
]
