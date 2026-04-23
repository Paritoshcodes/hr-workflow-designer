import clsx from 'clsx'
import { CheckCircle, ClipboardList, Flag, Plus, Zap } from 'lucide-react'
import type { ReactNode } from 'react'
import { useWorkflowStore } from '@/store/workflowStore'
import { createDefaultNodeData, type AISuggestion, type NodeType, type WorkflowNodeData } from '@/types/workflow'
import { nanoid } from 'nanoid'

const NODE_ICONS: Record<NodeType, ReactNode> = {
  start: null,
  task: <ClipboardList size={12} />,
  approval: <CheckCircle size={12} />,
  automated: <Zap size={12} />,
  end: <Flag size={12} />,
}

const NODE_COLORS: Record<NodeType, string> = {
  start: 'border-emerald-500/40 text-emerald-400',
  task: 'border-sky-500/40 text-sky-400',
  approval: 'border-amber-500/40 text-amber-400',
  automated: 'border-violet-500/40 text-violet-400',
  end: 'border-rose-500/40 text-rose-400',
}

interface NodeSuggestionChipProps {
  suggestion: AISuggestion
  sourceNodeId: string
  index: number
}

function SuggestionChip({ suggestion, sourceNodeId, index }: NodeSuggestionChipProps) {
  const nodes = useWorkflowStore((state) => state.nodes)
  const edges = useWorkflowStore((state) => state.edges)
  const clearSuggestions = useWorkflowStore((state) => state.clearSuggestions)
  const loadWorkflow = useWorkflowStore((state) => state.loadWorkflow)

  const handleClick = () => {
    const sourceNode = nodes.find((n) => n.id === sourceNodeId)
    if (!sourceNode) return

    const offsetX = (index - 1) * 180
    const newPosition = {
      x: sourceNode.position.x + offsetX,
      y: sourceNode.position.y + 170,
    }

    const newNodeId = nanoid(8)

    const nodeData = createDefaultNodeData(suggestion.nodeType)
    // Override title for the suggested node
    const titleKey = suggestion.nodeType === 'end' ? 'endMessage' : 'title'
    const updatedData = { ...nodeData, [titleKey]: suggestion.title } as WorkflowNodeData

    const newNode = {
      id: newNodeId,
      type: suggestion.nodeType,
      position: newPosition,
      data: updatedData,
    }

    const newEdge = {
      id: `e-${sourceNodeId}-${newNodeId}`,
      source: sourceNodeId,
      target: newNodeId,
      type: 'smoothstep' as const,
      animated: true,
    }

    loadWorkflow({
      nodes: [...nodes, newNode],
      edges: [...edges, newEdge],
    })

    clearSuggestions()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={clsx(
        'ui-transition group flex items-start gap-2 rounded-lg border border-dashed px-3 py-2 text-left',
        'bg-canvas-surface/80 backdrop-blur-sm hover:border-accent-orange/50 hover:bg-canvas-surface',
        NODE_COLORS[suggestion.nodeType]
      )}
      style={{
        position: 'absolute',
        top: `${50 + index * 44}px`,
        left: '240px',
        width: '220px',
        zIndex: 50,
      }}
    >
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-current/30">
        {NODE_ICONS[suggestion.nodeType] ?? <Plus size={12} />}
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-white">
          → {suggestion.title}
        </p>
        <p className="mt-0.5 text-[10px] leading-tight text-zinc-500 line-clamp-2">
          {suggestion.reason}
        </p>
      </div>
    </button>
  )
}

export function NodeSuggestionOverlay() {
  const suggestions = useWorkflowStore((state) => state.suggestions)
  const suggestionsForNodeId = useWorkflowStore((state) => state.suggestionsForNodeId)

  if (suggestions.length === 0 || !suggestionsForNodeId) return null

  return (
    <div className="pointer-events-auto">
      {suggestions.map((suggestion, index) => (
        <SuggestionChip
          key={`${suggestion.nodeType}-${suggestion.title}`}
          suggestion={suggestion}
          sourceNodeId={suggestionsForNodeId}
          index={index}
        />
      ))}
    </div>
  )
}
