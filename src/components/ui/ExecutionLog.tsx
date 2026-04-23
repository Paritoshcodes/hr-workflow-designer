import type { SimulationStep } from '@/types/workflow'

interface ExecutionLogProps {
  steps: SimulationStep[]
}

export function ExecutionLog({ steps }: ExecutionLogProps) {
  return (
    <div className="space-y-2">
      {steps.map((step) => (
        <div key={`${step.nodeId}-${step.timestamp}`} className="rounded-md border border-canvas-border p-2 text-xs">
          <p className="font-medium text-white">{step.nodeTitle}</p>
          <p className="mt-0.5 text-gray-400">{step.message}</p>
        </div>
      ))}
    </div>
  )
}
