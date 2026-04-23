import { Handle, Position } from '@xyflow/react'
import clsx from 'clsx'
import { AlertTriangle, Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { useValidation } from '@/hooks/useValidation'
import { useWorkflowStore } from '@/store/workflowStore'
import type { WorkflowNodeData } from '@/types/workflow'

interface StatBadge {
  label: string
  icon?: ReactNode
}

interface BaseNodeProps {
  id: string
  data: WorkflowNodeData
  selected: boolean
  accentColor: string
  icon: ReactNode
  children?: ReactNode
  hasSource?: boolean
  hasTarget?: boolean
  badges?: StatBadge[]
}

export function BaseNode({
  id,
  data,
  selected,
  accentColor,
  icon,
  children,
  hasSource = true,
  hasTarget = true,
  badges = [],
}: BaseNodeProps) {
  const deleteNode = useWorkflowStore((state) => state.deleteNode)
  const selectNode = useWorkflowStore((state) => state.selectNode)
  const highlightedNodeIds = useWorkflowStore((state) => state.highlightedNodeIds)
  const { hasNodeError, hasNodeWarning, getNodeErrors } = useValidation()

  const nodeErrors = getNodeErrors(id)
  const isError = hasNodeError(id)
  const isWarning = hasNodeWarning(id)
  const isHighlighted = highlightedNodeIds.includes(id)

  const title = data.type === 'end' ? data.endMessage : data.title

  return (
    <div
      onClick={() => selectNode(id)}
      className={clsx(
        'ui-transition group relative w-[220px] overflow-hidden rounded-lg border bg-[#1C1D22] shadow-md',
        'border-[#2A2B32]',
        selected && 'border-accent-orange shadow-[0_0_12px_rgba(249,115,22,0.3)]',
        isError && 'ring-2 ring-red-500/80',
        !isError && isWarning && 'ring-2 ring-amber-500/60',
        isHighlighted && 'ui-pulse-orange border-accent-orange'
      )}
      aria-label={`${data.type} node`}
    >
      {/* Left accent bar */}
      <div className={clsx('absolute left-0 top-0 bottom-0 w-1', accentColor)} />

      {hasTarget && (
        <Handle
          type="target"
          position={Position.Top}
          className="!h-3 !w-3 !border !border-[#2A2B32] !bg-[#1C1D22]"
        />
      )}

      <div className="pl-3.5 pr-3 pt-3 pb-2">
        {/* Header: icon + title + delete */}
        <div className="mb-1.5 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-canvas-bg">
              {icon}
            </span>
            <p className="max-w-[140px] truncate text-sm font-semibold text-white">{title}</p>
          </div>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              deleteNode(id)
            }}
            aria-label="Delete node"
            className="ui-transition rounded-md p-1 text-zinc-600 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2 size={11} />
          </button>
        </div>

        {/* Content */}
        {children && (
          <div className="mb-2 space-y-0.5 text-[11px] text-zinc-400">{children}</div>
        )}

        {/* Stat badges */}
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {badges.map((badge) => (
              <span
                key={badge.label}
                className="inline-flex items-center gap-1 rounded-full bg-canvas-bg px-2 py-0.5 text-[10px] text-zinc-500"
              >
                {badge.icon}
                {badge.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Validation error indicator */}
      {(isError || isWarning) && (
        <div className="absolute -right-1.5 -top-1.5">
          <span
            data-cy={`validation-error-${id}`}
            className={clsx(
              'inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px]',
              isError
                ? 'border-red-400/70 bg-red-500/20 text-red-300'
                : 'border-amber-400/70 bg-amber-500/20 text-amber-300'
            )}
          >
            <AlertTriangle size={11} />
          </span>
        </div>
      )}

      {/* Error tooltip */}
      {nodeErrors.length > 0 && (
        <div className="pointer-events-none absolute -bottom-12 left-1/2 z-20 hidden w-56 -translate-x-1/2 rounded-lg border border-canvas-border bg-canvas-bg p-2 text-[10px] text-zinc-300 shadow-xl group-hover:block">
          {nodeErrors.map((error) => (
            <p key={`${error.code}-${error.nodeId ?? 'graph'}`}>{error.message}</p>
          ))}
        </div>
      )}

      {hasSource && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!h-3 !w-3 !border !border-[#2A2B32] !bg-[#1C1D22]"
        />
      )}
    </div>
  )
}
