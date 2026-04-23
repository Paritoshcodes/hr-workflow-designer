import clsx from 'clsx'
import { BookOpen, CheckCircle, Clock, Loader2, Play, X, XCircle } from 'lucide-react'
import { useSimulate } from '@/hooks/useSimulate'
import { useWorkflowStore } from '@/store/workflowStore'

const STATUS_COLORS: Record<string, string> = {
  completed: 'text-emerald-400',
  running: 'text-accent-orange',
  failed: 'text-red-400',
  pending: 'text-zinc-500',
}

const STATUS_ICONS: Record<string, typeof CheckCircle> = {
  completed: CheckCircle,
  running: Loader2,
  failed: XCircle,
  pending: Clock,
}

export function WorkflowSandbox() {
  const simulationStatus = useWorkflowStore((state) => state.simulationStatus)
  const simulationSteps = useWorkflowStore((state) => state.simulationSteps)
  const simulationError = useWorkflowStore((state) => state.simulationError)
  const isSimulationPanelOpen = useWorkflowStore((state) => state.isSimulationPanelOpen)
  const toggleSimulationPanel = useWorkflowStore((state) => state.toggleSimulationPanel)
  const simulationNarrative = useWorkflowStore((state) => state.simulationNarrative)
  const isNarrating = useWorkflowStore((state) => state.isNarrating)
  const setRightPanelMode = useWorkflowStore((state) => state.setRightPanelMode)

  const { generateNarrative } = useSimulate()

  if (!isSimulationPanelOpen) return null

  return (
    <aside className="ui-slide-in-right flex h-full w-[300px] flex-col border-l border-canvas-border bg-canvas-surface">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-canvas-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Play size={14} className="text-accent-orange" />
          <p className="text-sm font-semibold text-white">Simulation</p>
          {simulationStatus === 'running' && (
            <Loader2 size={12} className="animate-spin text-accent-orange" />
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            toggleSimulationPanel()
            setRightPanelMode(null)
          }}
          className="ui-transition rounded-md p-1 text-zinc-400 hover:bg-canvas-bg hover:text-white"
          aria-label="Close simulation panel"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Status banner */}
        {simulationStatus === 'running' && (
          <div className="mb-3 rounded-lg bg-accent-orange/10 px-3 py-2">
            <div className="ui-shimmer h-1 rounded-full" />
            <p className="mt-1.5 text-xs text-accent-orange">Executing workflow steps...</p>
          </div>
        )}

        {simulationError && (
          <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2">
            <p className="text-xs text-red-300">{simulationError}</p>
          </div>
        )}

        {/* Steps timeline */}
        {simulationSteps.length > 0 && (
          <div className="space-y-0.5">
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-accent-secondary">
              Execution Log
            </p>
            {simulationSteps.map((step, index) => {
              const StatusIcon = STATUS_ICONS[step.status] ?? Clock
              const colorClass = STATUS_COLORS[step.status] ?? 'text-zinc-500'
              const isLast = index === simulationSteps.length - 1

              return (
                <div key={step.nodeId} className="flex gap-3">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div
                      className={clsx(
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                        step.status === 'completed'
                          ? 'border-emerald-500/40 bg-emerald-500/10'
                          : step.status === 'running'
                            ? 'border-accent-orange/40 bg-accent-orange/10'
                            : step.status === 'failed'
                              ? 'border-red-500/40 bg-red-500/10'
                              : 'border-zinc-700 bg-zinc-800'
                      )}
                    >
                      <StatusIcon
                        size={11}
                        className={clsx(
                          colorClass,
                          step.status === 'running' && 'animate-spin'
                        )}
                      />
                    </div>
                    {!isLast && <div className="w-px flex-1 bg-canvas-border" />}
                  </div>

                  {/* Step details */}
                  <div className="flex-1 pb-3">
                    <p className="text-xs font-medium text-white">{step.nodeTitle}</p>
                    <p className="text-[10px] text-zinc-500">
                      {step.nodeType} · {step.durationMs}ms
                    </p>
                    {step.message && (
                      <p className="mt-0.5 text-[10px] text-zinc-600">{step.message}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Narrative section */}
        {simulationStatus === 'completed' && (
          <div className="mt-4 border-t border-canvas-border pt-4">
            {!simulationNarrative && !isNarrating && (
              <button
                type="button"
                onClick={generateNarrative}
                className="ui-transition flex w-full items-center justify-center gap-2 rounded-lg border border-accent-orange/30 py-2 text-xs font-medium text-accent-orange hover:bg-accent-orange/10"
              >
                <BookOpen size={13} /> Generate Narrative
              </button>
            )}

            {(simulationNarrative || isNarrating) && (
              <div>
                <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-accent-secondary">
                  AI Narrative
                </p>
                <p className={clsx(
                  'text-xs leading-relaxed text-zinc-400',
                  isNarrating && 'ui-blink-cursor'
                )}>
                  {simulationNarrative || 'Generating...'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}
