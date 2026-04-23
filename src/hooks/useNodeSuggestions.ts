import { useCallback } from 'react'
import { useWorkflowStore } from '@/store/workflowStore'
import type { AISuggestion, NodeType } from '@/types/workflow'
import { callGroq } from '@/utils/groqClient'
import { parseAIJson } from '@/utils/parseAIJson'

const SUGGESTION_SYSTEM_PROMPT = `You are an HR workflow design assistant. Given a compact JSON summary of a workflow graph and the last placed node's type and title, suggest 1-3 possible next nodes that would logically follow in the workflow.

Return ONLY a valid JSON object matching this exact schema:
{
  "suggestions": [
    {
      "nodeType": "task | approval | automated | end",
      "title": "Short descriptive title",
      "reason": "One sentence explaining why this step logically follows"
    }
  ]
}

Rules:
- Suggest 1-3 nodes maximum
- Never suggest a "start" node
- Reasons should reference HR best practices
- Titles should be specific and action-oriented
- Do not wrap in markdown code fences`

interface SuggestionResponse {
  suggestions: Array<{
    nodeType: string
    title: string
    reason: string
  }>
}

export function useNodeSuggestions() {
  const store = useWorkflowStore()

  const fetchSuggestions = useCallback(
    async (nodeId: string) => {
      const { nodes, edges } = useWorkflowStore.getState()
      const lastNode = nodes.find((n) => n.id === nodeId)
      if (!lastNode) return

      // Build compact graph summary
      const graphSummary = {
        nodeCount: nodes.length,
        nodes: nodes.map((n) => ({
          id: n.id,
          type: n.data.type,
          title: n.data.type === 'end' ? (n.data as { endMessage: string }).endMessage : (n.data as { title: string }).title,
        })),
        edges: edges.map((e) => ({ from: e.source, to: e.target })),
      }

      const lastNodeTitle = lastNode.data.type === 'end'
        ? (lastNode.data as { endMessage: string }).endMessage
        : (lastNode.data as { title: string }).title

      const userPrompt = `Current workflow graph: ${JSON.stringify(graphSummary)}

Last placed node: type="${lastNode.data.type}", title="${lastNodeTitle}"

What nodes should come next?`

      try {
        const responseText = await callGroq(SUGGESTION_SYSTEM_PROMPT, userPrompt, {
          temperature: 0.7,
          maxTokens: 512,
        })

        const parsed = parseAIJson<SuggestionResponse>(responseText)

        if (!parsed?.suggestions || !Array.isArray(parsed.suggestions)) {
          store.clearSuggestions()
          return
        }

        const validNodeTypes: NodeType[] = ['task', 'approval', 'automated', 'end']
        const validSuggestions: AISuggestion[] = parsed.suggestions
          .filter((s) => validNodeTypes.includes(s.nodeType as NodeType))
          .slice(0, 3)
          .map((s) => ({
            nodeType: s.nodeType as NodeType,
            title: s.title,
            reason: s.reason,
          }))

        store.setSuggestions(validSuggestions, nodeId)
      } catch (error) {
        console.error('Node suggestion generation failed:', error)
        store.clearSuggestions()
      }
    },
    [store]
  )

  return { fetchSuggestions }
}
