import { useCallback } from 'react'
import { useWorkflowStore } from '@/store/workflowStore'
import {
  deserializeWorkflow,
  downloadWorkflowJSON,
  serializeWorkflow,
} from '@/utils/workflowSerializer'

export function useWorkflow() {
  const loadWorkflow = useWorkflowStore((state) => state.loadWorkflow)

  const exportWorkflow = useCallback(() => {
    const { nodes, edges, workflowName } = useWorkflowStore.getState()
    const serialized = serializeWorkflow(nodes, edges, workflowName)
    downloadWorkflowJSON(serialized)
  }, [])

  const importWorkflow = useCallback(
    (file: File) =>
      new Promise<void>((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = () => {
          try {
            const raw = String(reader.result)
            const parsedJson: unknown = JSON.parse(raw)
            const parsedWorkflow = deserializeWorkflow(parsedJson)
            loadWorkflow(parsedWorkflow)
            resolve()
          } catch (error) {
            reject(error)
          }
        }

        reader.onerror = () => {
          reject(new Error('Failed to read workflow file'))
        }

        reader.readAsText(file)
      }),
    [loadWorkflow]
  )

  return { exportWorkflow, importWorkflow }
}
