import clsx from 'clsx'
import { useReactFlow } from '@xyflow/react'
import {
  CheckCircle,
  LayoutPanelTop,
  Minus,
  Maximize2,
  Play,
  Plus,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSimulate } from '@/hooks/useSimulate'
import { useValidation } from '@/hooks/useValidation'
import { useWorkflowStore } from '@/store/workflowStore'
import { applyDagreLayout } from '@/utils/autoLayout'

export function BottomBar() {
  const { fitView, zoomIn, zoomOut, getZoom } = useReactFlow()

  const simulationStatus = useWorkflowStore((state) => state.simulationStatus)
  const { runSimulation } = useSimulate()
  const { validate } = useValidation()

  const [zoomLevel, setZoomLevel] = useState(100)

  useEffect(() => {
    const interval = setInterval(() => {
      try {
        setZoomLevel(Math.round(getZoom() * 100))
      } catch {
        // React Flow may not be ready yet
      }
    }, 500)
    return () => clearInterval(interval)
  }, [getZoom])

  const handleAutoLayout = () => {
    const { nodes, edges, loadWorkflow } = useWorkflowStore.getState()
    if (nodes.length === 0) return
    const laidOut = applyDagreLayout(nodes, edges)
    const straightEdges = edges.map((edge) => ({
      ...edge,
      type: 'smoothstep' as const,
      animated: true,
    }))

    loadWorkflow({ nodes: laidOut, edges: straightEdges })
    requestAnimationFrame(() => {
      fitView({ padding: 0.28, duration: 450, minZoom: 0.2, maxZoom: 1.1 })
    })
  }

  return (
    <div data-tutorial="bottom-bar" className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between border-t border-canvas-border bg-canvas-surface/95 px-4 py-2 backdrop-blur-sm">
      {/* Left: Zoom controls */}
      <div className="flex items-center gap-2">
        <span className="min-w-[40px] text-center text-xs font-medium text-zinc-400">
          {zoomLevel}%
        </span>
        <button
          type="button"
          onClick={() => zoomOut()}
          className="ui-transition rounded-md p-1 text-zinc-500 hover:bg-canvas-bg hover:text-white"
          aria-label="Zoom out"
        >
          <Minus size={14} />
        </button>
        <button
          type="button"
          onClick={() => zoomIn()}
          className="ui-transition rounded-md p-1 text-zinc-500 hover:bg-canvas-bg hover:text-white"
          aria-label="Zoom in"
        >
          <Plus size={14} />
        </button>
        <button
          type="button"
          onClick={() => fitView({ padding: 0.28, duration: 450 })}
          className="ui-transition rounded-md p-1 text-zinc-500 hover:bg-canvas-bg hover:text-white"
          aria-label="Fit to view"
        >
          <Maximize2 size={14} />
        </button>
      </div>

      {/* Center: Action buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={validate}
          aria-label="Validate workflow"
          className="ui-transition flex items-center gap-1.5 rounded-lg border border-canvas-border px-3 py-1.5 text-xs text-zinc-400 hover:border-zinc-500 hover:text-white"
        >
          <CheckCircle size={13} /> Validate
        </button>

        <button
          type="button"
          onClick={handleAutoLayout}
          aria-label="Auto layout"
          className="ui-transition flex items-center gap-1.5 rounded-lg border border-canvas-border px-3 py-1.5 text-xs text-zinc-400 hover:border-zinc-500 hover:text-white"
        >
          <LayoutPanelTop size={13} /> Auto Layout
        </button>

        <button
          data-tutorial="simulate-btn"
          data-cy="btn-simulate"
          type="button"
          onClick={runSimulation}
          disabled={simulationStatus === 'running'}
          aria-label="Run simulation"
          className={clsx(
            'ui-transition flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-medium text-white',
            'bg-accent-orange hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50'
          )}
        >
          <Play size={13} />
          {simulationStatus === 'running' ? 'Running...' : 'Simulate'}
        </button>
      </div>

      {/* Right spacer for balance */}
      <div className="w-[100px]" />
    </div>
  )
}
