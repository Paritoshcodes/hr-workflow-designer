import type { Automation, SerializedWorkflow, SimulationResult } from '@/types/workflow'

async function readResponseSafely<T>(response: Response): Promise<{ ok: boolean; data?: T; text?: string }> {
  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    try {
      const data = (await response.json()) as T
      return { ok: response.ok, data }
    } catch {
      return { ok: response.ok, text: 'Invalid JSON response' }
    }
  }

  const text = await response.text().catch(() => 'Unknown response error')
  return { ok: response.ok, text: text || 'Unknown response error' }
}

export async function fetchAutomations(): Promise<Automation[]> {
  const response = await fetch('/api/automations')

  const result = await readResponseSafely<Automation[]>(response)
  if (!result.ok) {
    throw new Error(result.text ?? 'Failed to load automations')
  }

  if (!result.data) {
    throw new Error('Failed to load automations')
  }
  return result.data
}

export async function simulateWorkflow(payload: SerializedWorkflow): Promise<SimulationResult> {
  const response = await fetch('/api/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const result = await readResponseSafely<SimulationResult>(response)
  if (!result.ok) {
    const messageFromBody =
      result.data && typeof result.data.error === 'string' ? result.data.error : undefined
    throw new Error(messageFromBody ?? result.text ?? 'Simulation failed')
  }

  if (!result.data) {
    throw new Error('Simulation failed')
  }

  if (!result.data.success) {
    const status = (result.data as unknown as { status?: string }).status
    if (status !== 'success') {
      throw new Error(result.data.error ?? 'Simulation failed')
    }
  }
  if (!result.data.success) {
    if (!Array.isArray(result.data.steps)) {
      throw new Error('Simulation failed')
    }
    return {
      success: true,
      steps: result.data.steps,
      totalDurationMs: 0,
    }
  }

  return result.data
}
