import { useCallback } from 'react'
import { simulateWorkflow } from '@/api/workflowApi'
import { useWorkflowStore } from '@/store/workflowStore'
import { serializeWorkflow } from '@/utils/workflowSerializer'
import { callGroqStream } from '@/utils/groqClient'

const NARRATOR_SYSTEM_PROMPT = `You are an HR workflow execution narrator. Given a step-by-step simulation log in JSON format, write a concise plain-English paragraph explaining what happened in this workflow run as if narrating it to an HR manager. Highlight any steps that took unusually long (over 1000ms). Keep it under 150 words. Be professional but conversational.`

export function useSimulate() {
  const store = useWorkflowStore()

  const runSimulation = useCallback(async () => {
    const { nodes, edges, workflowName } = useWorkflowStore.getState()

    const validationResult = store.validate()
    if (!validationResult.isValid) {
      store.setSimulationStatus('failed')
      store.setSimulationSteps([])
      store.setSimulationError(
        `Cannot simulate: resolve ${validationResult.errors.length} validation error(s) first.`
      )

      if (!store.isSimulationPanelOpen) {
        store.toggleSimulationPanel()
      }

      store.setRightPanelMode('simulation')
      return
    }

    store.setSimulationStatus('running')
    store.setSimulationSteps([])
    store.setSimulationError(null)
    store.setSimulationNarrative('')

    if (!store.isSimulationPanelOpen) {
      store.toggleSimulationPanel()
    }

    store.setRightPanelMode('simulation')

    try {
      const payload = serializeWorkflow(nodes, edges, workflowName)
      const result = await simulateWorkflow(payload)

      store.setSimulationSteps(result.steps)
      store.setSimulationStatus('completed')
    } catch (error) {
      store.setSimulationStatus('failed')
      store.setSimulationError(error instanceof Error ? error.message : 'Unknown simulation error')
    }
  }, [store])

  const generateNarrative = useCallback(async () => {
    const { simulationSteps } = useWorkflowStore.getState()

    if (simulationSteps.length === 0) return

    store.setIsNarrating(true)
    store.setSimulationNarrative('')

    const logSummary = JSON.stringify(
      simulationSteps.map((s) => ({
        node: s.nodeTitle,
        type: s.nodeType,
        status: s.status,
        duration: `${s.durationMs}ms`,
        message: s.message,
      })),
      null,
      2
    )

    try {
      await callGroqStream(
        NARRATOR_SYSTEM_PROMPT,
        `Simulation log:\n${logSummary}`,
        (chunk) => {
          const current = useWorkflowStore.getState().simulationNarrative
          store.setSimulationNarrative(current + chunk)
        }
      )
    } catch (error) {
      console.error('Narrative generation failed:', error)
      store.setSimulationNarrative('Narrative generation failed. Please try again.')
    } finally {
      store.setIsNarrating(false)
    }
  }, [store])

  return { runSimulation, generateNarrative }
}
