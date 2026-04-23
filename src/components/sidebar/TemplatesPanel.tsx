import { Calendar, FileCheck, UserPlus } from 'lucide-react'
import { WORKFLOW_TEMPLATES } from '@/data/templates'
import { useWorkflowStore } from '@/store/workflowStore'

const ICON_MAP = {
  UserPlus,
  Calendar,
  FileCheck,
} as const

export function TemplatesPanel() {
  const loadWorkflow = useWorkflowStore((state) => state.loadWorkflow)

  return (
    <div className="space-y-2">
      <p className="mb-3 text-xs text-gray-500">Load a pre-built workflow template</p>
      {WORKFLOW_TEMPLATES.map((template) => {
        const Icon = ICON_MAP[template.icon as keyof typeof ICON_MAP] ?? UserPlus

        return (
          <button
            key={template.id}
            data-cy={`template-${template.id}`}
            onClick={() => loadWorkflow(template.workflow)}
            className="ui-transition ui-lift group w-full rounded-lg border border-canvas-border bg-canvas-bg p-3 text-left hover:border-accent-primary"
            aria-label={`Load ${template.name} template`}
          >
            <div className="flex items-start gap-2">
              <Icon size={14} className="mt-0.5 shrink-0 text-accent-primary" />
              <div>
                <p className="text-xs font-semibold text-white transition-colors group-hover:text-accent-primary">
                  {template.name}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">{template.description}</p>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
