import { useWorkflowStore } from '@/store/workflowStore'
import type { EndNodeData } from '@/types/workflow'
import { FormField } from './FormPrimitives'
import { inputClass } from './FormStyles'

interface Props {
  nodeId: string
  data: EndNodeData
}

export function EndNodeForm({ nodeId, data }: Props) {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData)

  const update = (partial: Partial<EndNodeData>) => {
    updateNodeData(nodeId, partial)
  }

  return (
    <div>
      <FormField label="Completion Message">
        <input
          className={inputClass}
          value={data.endMessage}
          onChange={(event) => update({ endMessage: event.target.value })}
          placeholder="Workflow complete"
          aria-label="End message"
        />
      </FormField>

      <label className="inline-flex items-center gap-2 text-sm text-gray-300">
        <input
          type="checkbox"
          checked={data.showSummary}
          onChange={(event) => update({ showSummary: event.target.checked })}
          aria-label="Show summary"
        />
        Show summary to user
      </label>
    </div>
  )
}
