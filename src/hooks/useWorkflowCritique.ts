import { useCallback } from 'react'
import { useWorkflowStore } from '@/store/workflowStore'
import type { CritiqueResult } from '@/types/workflow'
import { callGroq } from '@/utils/groqClient'
import { parseAIJson } from '@/utils/parseAIJson'

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

const FALLBACK_CRITIQUE: CritiqueResult = {
  overallScore: 0,
  issues: [],
  summary: 'Critique unavailable. Check your GROQ_API_KEY.',
}

export function useWorkflowCritique() {
  const store = useWorkflowStore()

  const runCritique = useCallback(async () => {
    const { nodes, edges } = useWorkflowStore.getState()

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

      if (
        !parsed ||
        typeof parsed.overallScore !== 'number' ||
        !Array.isArray(parsed.issues)
      ) {
        console.warn('AI returned invalid critique format, using fallback')
        store.setCritiqueResult(FALLBACK_CRITIQUE)
        return
      }

      store.setCritiqueResult(parsed)
    } catch (error) {
      console.error('Workflow critique failed:', error)
      store.setCritiqueError(error instanceof Error ? error.message : 'Critique failed')
      store.setCritiqueResult(FALLBACK_CRITIQUE)
    } finally {
      store.setIsCritiquing(false)
    }
  }, [store])

  return { runCritique }
}
