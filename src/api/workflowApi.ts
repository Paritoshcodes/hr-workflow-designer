import type { Automation, SerializedWorkflow, SimulationResult } from '@/types/workflow'

export async function fetchAutomations(): Promise<Automation[]> {
  const response = await fetch('/automations')

  if (!response.ok) {
    throw new Error('Failed to load automations')
  }

  return (await response.json()) as Automation[]
}

export async function simulateWorkflow(payload: SerializedWorkflow): Promise<SimulationResult> {
  const response = await fetch('/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const result = (await response.json()) as SimulationResult

  if (!response.ok || !result.success) {
    throw new Error(result.error ?? 'Simulation failed')
  }

  return result
}
