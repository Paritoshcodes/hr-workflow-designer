import { useCallback } from 'react'
import { useWorkflowStore } from '@/store/workflowStore'
import type { CritiqueIssue, CritiqueResult, WorkflowEdge, WorkflowNode } from '@/types/workflow'
import { callGroq } from '@/utils/groqClient'
import { parseAIJson } from '@/utils/parseAIJson'
import { validateWorkflow } from '@/utils/graphTraversal'

const CRITIQUE_SYSTEM_PROMPT = `You are an HR process expert and workflow auditor. Given a serialized HR workflow graph (nodes and edges as JSON), analyze it for correctness, completeness, and HR best practices.

Return ONLY a valid JSON object matching this exact schema:
{
  "overallScore": <number 0-100>,
  "issues": [
    {
      "nodeId": "<id of the problematic node, or empty string if graph-level>",
      "severity": "error" | "warning" | "suggestion",
      "message": "Clear description of the issue"
    }
  ],
  "summary": "A 2-3 sentence summary of the workflow quality and main recommendations."
}

Scoring methodology (follow this precisely):
Start at 100 and subtract points for actual issues found:
- Each "error" (broken structure, missing start/end, disconnected nodes): -15 points
- Each "warning" (missing notification step, no approval for sensitive ops): -5 points  
- Each "suggestion" (nice-to-have improvements): -2 points

Do NOT subtract points for:
- The workflow being "simple" — a workflow with the right steps for its purpose is correct
- Not having parallel paths — linear workflows are perfectly valid
- Not having conditional branching — that is an advanced feature, not a requirement
- Aspirational features like "real-time monitoring" or "ML-based routing"

A workflow that has: a start node, an end node, at least one task or approval step, a notification step, proper assignees, and all nodes connected should score 90 or above.

Only flag real issues:
- Missing start or end node (error)
- Disconnected/orphan nodes (error)
- No notification or communication step in the entire workflow (warning)
- Task nodes without an assignee (warning)
- No approval step for workflows involving sensitive data (warning)
- No documentation/record-keeping step (suggestion)
- Generic or placeholder node titles (suggestion)`

function getNodeTitle(node: WorkflowNode): string {
  if (node.data.type === 'end') {
    return (node.data as { endMessage?: string }).endMessage ?? ''
  }
  return (node.data as { title?: string }).title ?? ''
}

function computeDeterministicCritique(nodes: WorkflowNode[], edges: WorkflowEdge[]): CritiqueResult {
  const issues: CritiqueIssue[] = []
  const validation = validateWorkflow(nodes, edges)
  const seen = new Set<string>()
  const addIssue = (issue: CritiqueIssue) => {
    const key = `${issue.nodeId}:${issue.severity}:${issue.message}`
    if (seen.has(key)) return
    seen.add(key)
    issues.push(issue)
  }

  for (const error of validation.errors) {
    addIssue({
      nodeId: error.nodeId ?? '',
      severity: 'error',
      message: error.message,
    })
  }

  for (const warning of validation.warnings) {
    addIssue({
      nodeId: warning.nodeId ?? '',
      severity: 'warning',
      message: warning.message,
    })
  }
  const startNodes = nodes.filter((n) => n.data.type === 'start')
  const endNodes = nodes.filter((n) => n.data.type === 'end')

  if (startNodes.length === 0) {
    issues.push({ nodeId: '', severity: 'error', message: 'Missing start node.' })
  } else if (startNodes.length > 1) {
    for (const node of startNodes) {
      issues.push({ nodeId: node.id, severity: 'error', message: 'Multiple start nodes found.' })
    }
  }

  if (endNodes.length === 0) {
    issues.push({ nodeId: '', severity: 'error', message: 'Missing end node.' })
  }

  const hasNotification = nodes.some(
    (n) => n.data.type === 'automated' && typeof (n.data as { actionId?: string }).actionId === 'string'
  )
  if (!hasNotification) {
    issues.push({ nodeId: '', severity: 'warning', message: 'No automated notification step found.' })
  }

  const hasApproval = nodes.some((n) => n.data.type === 'approval')
  if (!hasApproval) {
    issues.push({ nodeId: '', severity: 'warning', message: 'No approval step found.' })
  }

  const hasDocumentation = nodes.some(
    (n) =>
      n.data.type === 'automated' &&
      ['update_hris', 'generate_doc'].includes(String((n.data as { actionId?: string }).actionId ?? ''))
  )
  if (!hasDocumentation) {
    issues.push({ nodeId: '', severity: 'suggestion', message: 'Add a documentation or record-keeping step.' })
  }

  const genericTitles = ['start', 'end', 'task', 'approval', 'automated', 'new task']
  for (const node of nodes) {
    const title = getNodeTitle(node).trim().toLowerCase()
    if (title && genericTitles.includes(title)) {
      issues.push({ nodeId: node.id, severity: 'suggestion', message: 'Use a more specific title for this step.' })
    }
  }

  const score = issues.reduce((total, issue) => {
    if (issue.severity === 'error') return total - 15
    if (issue.severity === 'warning') return total - 5
    return total - 2
  }, 100)

  const clampedScore = Math.max(0, Math.min(100, score))
  const errorCount = issues.filter((i) => i.severity === 'error').length
  const warningCount = issues.filter((i) => i.severity === 'warning').length
  const suggestionCount = issues.filter((i) => i.severity === 'suggestion').length

  const summaryParts = [] as string[]
  summaryParts.push(`Score ${clampedScore}/100.`)
  if (errorCount > 0) summaryParts.push(`${errorCount} error(s) need attention.`)
  if (warningCount > 0) summaryParts.push(`${warningCount} warning(s) to review.`)
  if (suggestionCount > 0) summaryParts.push(`${suggestionCount} suggestion(s) to consider.`)
  if (issues.length === 0) summaryParts.push('Workflow checks passed with no issues found.')

  return {
    overallScore: clampedScore,
    issues,
    summary: summaryParts.join(' '),
  }
}

export function useWorkflowCritique() {
  const store = useWorkflowStore()

  const runCritique = useCallback(async () => {
    const { nodes, edges } = useWorkflowStore.getState()
    const deterministic = computeDeterministicCritique(nodes, edges)

    if (nodes.length === 0) {
      store.setCritiqueResult({
        overallScore: 0,
        issues: [],
        summary: 'No workflow to critique. Add some nodes to the canvas first.',
      })
      store.setRightPanelMode('critique')
      return
    }

    store.setIsCritiquing(true)
    store.setCritiqueError(null)
    store.setRightPanelMode('critique')

    const graphSummary = {
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.data.type,
        title: n.data.type === 'end'
          ? (n.data as { endMessage: string }).endMessage
          : (n.data as { title: string }).title,
        ...(n.data.type === 'task' ? {
          assignee: (n.data as { assignee: string }).assignee,
          description: (n.data as { description: string }).description,
        } : {}),
        ...(n.data.type === 'approval' ? {
          approverRole: (n.data as { approverRole: string }).approverRole,
        } : {}),
        ...(n.data.type === 'automated' ? {
          actionId: (n.data as { actionId: string }).actionId,
        } : {}),
      })),
      edges: edges.map((e) => ({ source: e.source, target: e.target })),
    }

    const userPrompt = `Analyze this HR workflow:\n${JSON.stringify(graphSummary, null, 2)}`

    try {
      const responseText = await callGroq(CRITIQUE_SYSTEM_PROMPT, userPrompt, {
        temperature: 0.3,
        maxTokens: 1024,
      })

      const parsed = parseAIJson<CritiqueResult>(responseText)

      if (!parsed || typeof parsed.summary !== 'string') {
        if (import.meta.env.DEV) {
          console.warn('AI returned invalid critique format, using deterministic result')
        }
        store.setCritiqueResult(deterministic)
        return
      }

      store.setCritiqueResult({
        ...deterministic,
        summary: deterministic.issues.length === 0 ? parsed.summary : deterministic.summary,
      })
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Workflow critique failed:', error)
      }
      store.setCritiqueError(error instanceof Error ? error.message : 'Critique failed')
      store.setCritiqueResult(deterministic)
    } finally {
      store.setIsCritiquing(false)
    }
  }, [store])

  return { runCritique }
}
