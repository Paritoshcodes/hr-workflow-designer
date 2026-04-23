import clsx from 'clsx'
import {
  Download,
  Settings,
  Upload,
  Wand2,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
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
  const [isHoveringTitle, setIsHoveringTitle] = useState(false)
  const titleInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) {
      titleInputRef.current?.focus()
      titleInputRef.current?.select()
    }
  }, [isEditing])

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
          <div
            className="inline-flex items-center min-h-[32px]"
            onMouseEnter={() => setIsHoveringTitle(true)}
            onMouseLeave={() => {
              if (!isEditing) {
                setIsHoveringTitle(false)
              }
            }}
          >
            {(isEditing || isHoveringTitle) ? (
              <input
                ref={titleInputRef}
                className={clsx(
                  'ui-transition h-[28px] w-[220px] rounded-md border px-2 text-sm font-semibold text-white focus:outline-none',
                  'border-accent-orange/30 bg-accent-orange/10 focus:border-accent-orange/60',
                  'transition-opacity duration-200 ease-out',
                  !isEditing && 'cursor-pointer'
                )}
                style={{ opacity: isEditing || isHoveringTitle ? 1 : 0 }}
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                onBlur={() => {
                  setIsEditing(false)
                  setIsHoveringTitle(false)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setIsEditing(false)
                    setIsHoveringTitle(false)
                  }
                }}
                onClick={() => setIsEditing(true)}
                aria-label="Workflow name"
              />
            ) : (
              <h2
                className="cursor-pointer text-sm font-semibold text-white hover:text-accent-orange"
                onClick={() => setIsEditing(true)}
                title="Click to edit"
              >
                {workflowName}
              </h2>
            )}
          </div>
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
