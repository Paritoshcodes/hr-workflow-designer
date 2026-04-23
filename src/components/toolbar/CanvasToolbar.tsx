import clsx from 'clsx'
import {
  Download,
  Settings,
  Upload,
  Wand2,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { useWorkflow } from '@/hooks/useWorkflow'
import { useWorkflowCritique } from '@/hooks/useWorkflowCritique'
import { useWorkflowStore } from '@/store/workflowStore'

export function CanvasToolbar() {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const workflowName = useWorkflowStore((state) => state.workflowName)
  const setWorkflowName = useWorkflowStore((state) => state.setWorkflowName)

  const { exportWorkflow, importWorkflow } = useWorkflow()
  const { runCritique } = useWorkflowCritique()

  const [isEditing, setIsEditing] = useState(false)

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      await importWorkflow(file)
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Failed to import workflow')
    }
    event.target.value = ''
  }

  return (
    <div className="flex items-center justify-between border-b border-canvas-border bg-canvas-surface px-5 py-2.5">
      {/* Left: Title + subtitle */}
      <div className="flex items-center gap-3">
        <div>
          {isEditing ? (
            <input
              className="border-b border-accent-orange bg-transparent px-1 py-0.5 text-sm font-semibold text-white focus:outline-none"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              onBlur={() => setIsEditing(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
              autoFocus
              aria-label="Workflow name"
            />
          ) : (
            <h2
              className="cursor-pointer text-sm font-semibold text-white hover:text-accent-orange"
              onDoubleClick={() => setIsEditing(true)}
              title="Double-click to edit"
            >
              {workflowName}
            </h2>
          )}
          <p className="text-[11px] text-accent-secondary">Overview of User Workflows</p>
        </div>
      </div>

      {/* Right: Action buttons */}
      <div data-tutorial="toolbar-actions" className="flex items-center gap-2">
        <button
          data-tutorial="critique-btn"
          type="button"
          onClick={runCritique}
          title="AI Critique"
          className={clsx(
            'ui-transition flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium',
            'border border-accent-orange/30 text-accent-orange hover:bg-accent-orange/10'
          )}
        >
          <Wand2 size={14} /> Critique
        </button>

        <button
          type="button"
          onClick={exportWorkflow}
          className="ui-transition flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-canvas-bg hover:text-white border border-transparent hover:border-canvas-border"
          aria-label="Export Workflow"
        >
          <Upload size={14} /> Export Workflow
        </button>

        <button
          data-cy="btn-import"
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="ui-transition flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-canvas-bg hover:text-white border border-transparent hover:border-canvas-border"
          aria-label="Import Workflow"
        >
          <Download size={14} /> Import Workflow
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleImport}
        />

        <button
          type="button"
          title="Settings"
          className="ui-transition rounded-lg p-2 text-zinc-400 hover:bg-canvas-bg hover:text-white"
          aria-label="Settings"
        >
          <Settings size={16} />
        </button>
      </div>
    </div>
  )
}
