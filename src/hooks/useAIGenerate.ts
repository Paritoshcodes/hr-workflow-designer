import { useCallback } from 'react'
import { WORKFLOW_TEMPLATES } from '@/data/templates'
import { useWorkflowStore } from '@/store/workflowStore'
import type { WorkflowEdge, WorkflowNode } from '@/types/workflow'
import { callGroq } from '@/utils/groqClient'
import { parseAIJson } from '@/utils/parseAIJson'

const SYSTEM_PROMPT = `You are a senior HR workflow automation architect. When given a description of an HR workflow, you respond ONLY with a valid JSON object and nothing else. No explanation, no markdown, no preamble. The JSON must match this exact schema:
{
  "nodes": [
    {
      "id": "string (unique, e.g. 'node-1')",
      "type": "start | task | approval | automated | end",
      "position": { "x": number, "y": number },
      "data": {
        "type": "start | task | approval | automated | end",
        "title": "string",
        "description": "string (optional)",
        "metadata": [],
        "assignee": "string (for task nodes)",
        "dueDate": "string (for task nodes)",
        "customFields": [],
        "approverRole": "string (for approval nodes)",
        "autoApproveThreshold": 0,
        "actionId": "string (for automated nodes, use: send_email, generate_doc, update_hris, notify_slack, assign_task)",
        "actionParams": {},
        "endMessage": "string (for end nodes)",
        "showSummary": true
      }
    }
  ],
  "edges": [
    {
      "id": "string (unique, e.g. 'edge-1')",
      "source": "node id",
      "target": "node id"
    }
  ]
}
Mandatory rules:
- Always start with exactly one node of type "start" and end with exactly one node of type "end"
- Position nodes top-to-bottom: start at y=50, increment y by 150 for each subsequent node, center x around 400
- Include 6-10 nodes total for a complete, production-ready workflow
- Every node must be connected; no orphan nodes
- Each node's "data.type" must match the node's "type" field

Quality rules (CRITICAL — your workflows must score 95-100 on HR process audits):
- ALWAYS include at least one "automated" notification step (e.g. send_email or notify_slack) to keep stakeholders informed
- ALWAYS include at least one "approval" step for any workflow involving sensitive data, role changes, or financial impact
- ALWAYS assign realistic HR role names to task assignees (e.g. "HR Admin", "Hiring Manager", "IT Support", "HRBP", "Payroll Team")
- ALWAYS include a documentation or record-keeping step (automated with actionId "update_hris" or "generate_doc")
- Include meaningful descriptions for every task node
- Use the "start" node's metadata array to capture relevant context (e.g. department, priority level)

Node data requirements:
- For "start" nodes: type, title, metadata (array of {id, key, value} objects — include at least one)
- For "task" nodes: type, title, description, assignee (realistic role name), dueDate (empty string), customFields (array)
- For "approval" nodes: type, title, approverRole (realistic role), autoApproveThreshold (0)
- For "automated" nodes: type, title, actionId (from the allowed list), actionParams (object with relevant keys)
- For "end" nodes: type, endMessage (descriptive completion message), showSummary (true)`

interface WorkflowGraph {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
}

function getFallbackWorkflow(): WorkflowGraph {
  const template = WORKFLOW_TEMPLATES[0]
  return {
    nodes: template.workflow.nodes,
    edges: template.workflow.edges,
  }
}

export function useAIGenerate() {
  const store = useWorkflowStore()

  const generateWorkflow = useCallback(
    async (prompt: string) => {
      if (!prompt.trim()) {
        return
      }

      store.setGenerating(true)
      store.setGenerateError(null)

      try {
        const responseText = await callGroq(SYSTEM_PROMPT, prompt, {
          temperature: 0.2,
          maxTokens: 2048,
        })

        const parsed = parseAIJson<WorkflowGraph>(responseText)

        if (!parsed || !Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
          console.warn('AI returned invalid workflow JSON, loading fallback template')
          store.loadWorkflow(getFallbackWorkflow())
          store.setGenerateError('AI returned an invalid format. Loaded a default template instead.')
          return
        }

        store.loadWorkflow(parsed)
      } catch (error) {
        console.error('AI workflow generation failed:', error)
        const message = error instanceof Error ? error.message : 'Failed to generate workflow'
        store.setGenerateError(message)

        // Fallback: load the onboarding template
        store.loadWorkflow(getFallbackWorkflow())
      } finally {
        store.setGenerating(false)
      }
    },
    [store]
  )

  return { generateWorkflow }
}
