import clsx from 'clsx'
import {
  AlertTriangle,
  CheckCircle,
  Info,
  Loader2,
  X,
  XCircle,
} from 'lucide-react'
import { useReactFlow } from '@xyflow/react'
import { useWorkflowStore } from '@/store/workflowStore'
import type { CritiqueSeverity } from '@/types/workflow'

const SEVERITY_CONFIG: Record<
  CritiqueSeverity,
  { icon: typeof AlertTriangle; color: string; bgColor: string; label: string }
> = {
  error: {
    icon: XCircle,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10 border-red-500/30',
    label: 'Error',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10 border-amber-500/30',
    label: 'Warning',
  },
  suggestion: {
    icon: Info,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10 border-blue-500/30',
    label: 'Suggestion',
  },
}

function ScoreArc({ score }: { score: number }) {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference
  const color =
    score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'

  return (
    <div className="flex flex-col items-center">
      <svg width="100" height="100" viewBox="0 0 100 100">
        {/* Background arc */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#2A2B32"
          strokeWidth="6"
        />
        {/* Progress arc */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={`${progress} ${circumference}`}
          strokeDashoffset={circumference / 4}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          className="transition-all duration-1000 ease-out"
        />
        {/* Score text */}
        <text
          x="50"
          y="48"
          textAnchor="middle"
          fill="white"
          fontSize="20"
          fontWeight="bold"
        >
          {score}
        </text>
        <text
          x="50"
          y="62"
          textAnchor="middle"
          fill="#71717A"
          fontSize="9"
        >
          / 100
        </text>
      </svg>
    </div>
  )
}

export function CritiquePanel() {
  const { setCenter } = useReactFlow()
  const critiqueResult = useWorkflowStore((state) => state.critiqueResult)
  const isCritiquing = useWorkflowStore((state) => state.isCritiquing)
  const critiqueError = useWorkflowStore((state) => state.critiqueError)
  const setRightPanelMode = useWorkflowStore((state) => state.setRightPanelMode)
  const selectNode = useWorkflowStore((state) => state.selectNode)
  const nodes = useWorkflowStore((state) => state.nodes)

  const handleIssueClick = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId)
    if (node) {
      setCenter(node.position.x + 110, node.position.y + 45, {
        zoom: 1.2,
        duration: 500,
      })
      selectNode(nodeId)
    }
  }

  if (isCritiquing) {
    return (
      <aside className="ui-slide-in-right flex h-full w-[300px] flex-col border-l border-canvas-border bg-canvas-surface">
        <div className="flex items-center justify-between border-b border-canvas-border px-4 py-3">
          <p className="text-sm font-semibold text-white">AI Critique</p>
          <button
            type="button"
            onClick={() => setRightPanelMode(null)}
            className="ui-transition rounded-md p-1 text-zinc-400 hover:bg-canvas-bg hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={24} className="animate-spin text-accent-orange" />
            <p className="text-sm text-zinc-400">Analyzing workflow...</p>
          </div>
        </div>
      </aside>
    )
  }

  if (!critiqueResult) return null

  const errorIssues = critiqueResult.issues.filter((i) => i.severity === 'error')
  const warningIssues = critiqueResult.issues.filter((i) => i.severity === 'warning')
  const suggestionIssues = critiqueResult.issues.filter((i) => i.severity === 'suggestion')
  const groupedIssues = [...errorIssues, ...warningIssues, ...suggestionIssues]

  return (
    <aside className="ui-slide-in-right flex h-full w-[300px] flex-col border-l border-canvas-border bg-canvas-surface">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-canvas-border px-4 py-3">
        <div className="flex items-center gap-2">
          <CheckCircle size={14} className="text-accent-orange" />
          <p className="text-sm font-semibold text-white">AI Critique</p>
        </div>
        <button
          type="button"
          onClick={() => setRightPanelMode(null)}
          className="ui-transition rounded-md p-1 text-zinc-400 hover:bg-canvas-bg hover:text-white"
          aria-label="Close critique panel"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {critiqueError && (
          <p className="mb-3 rounded-md border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-300">
            {critiqueError}
          </p>
        )}

        {/* Score */}
        <div className="mb-4 flex justify-center">
          <ScoreArc score={critiqueResult.overallScore} />
        </div>

        {/* Issues */}
        {groupedIssues.length > 0 && (
          <div className="mb-4 space-y-2">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-accent-secondary">
              Issues ({groupedIssues.length})
            </p>
            {groupedIssues.map((issue, index) => {
              const config = SEVERITY_CONFIG[issue.severity]
              const Icon = config.icon
              return (
                <button
                  key={`${issue.nodeId}-${index}`}
                  type="button"
                  onClick={() => issue.nodeId && handleIssueClick(issue.nodeId)}
                  className={clsx(
                    'w-full rounded-lg border p-2.5 text-left text-xs transition-colors',
                    config.bgColor,
                    issue.nodeId && 'cursor-pointer hover:brightness-125'
                  )}
                >
                  <div className="flex items-start gap-2">
                    <Icon size={13} className={clsx('mt-0.5 shrink-0', config.color)} />
                    <div>
                      <span className={clsx('text-[10px] font-medium uppercase', config.color)}>
                        {config.label}
                      </span>
                      <p className="mt-0.5 text-zinc-300">{issue.message}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* Summary */}
        <div>
          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-accent-secondary">
            Summary
          </p>
          <p className="text-xs leading-relaxed text-zinc-400">{critiqueResult.summary}</p>
        </div>
      </div>
    </aside>
  )
}
