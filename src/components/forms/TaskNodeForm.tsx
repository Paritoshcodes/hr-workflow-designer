import { Plus, X } from 'lucide-react'
import { nanoid } from 'nanoid'
import { useWorkflowStore } from '@/store/workflowStore'
import type { TaskNodeData } from '@/types/workflow'
import { FormField } from './FormPrimitives'
import { inputClass, textareaClass } from './FormStyles'

interface Props {
  nodeId: string
  data: TaskNodeData
}

export function TaskNodeForm({ nodeId, data }: Props) {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData)

  const update = (partial: Partial<TaskNodeData>) => {
    updateNodeData(nodeId, partial)
  }

  const addField = () => {
    update({ customFields: [...data.customFields, { id: nanoid(4), key: '', value: '' }] })
  }

  const removeField = (id: string) => {
    update({ customFields: data.customFields.filter((field) => field.id !== id) })
  }

  const updateField = (id: string, field: 'key' | 'value', value: string) => {
    update({
      customFields: data.customFields.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    })
  }

  return (
    <div>
      <FormField label="Title *">
        <input
          className={inputClass}
          value={data.title}
          onChange={(event) => update({ title: event.target.value })}
          placeholder="Task title"
          aria-label="Task title"
        />
      </FormField>

      <FormField label="Description">
        <textarea
          className={textareaClass}
          value={data.description}
          onChange={(event) => update({ description: event.target.value })}
          placeholder="What should be done?"
          aria-label="Task description"
        />
      </FormField>

      <FormField label="Assignee">
        <input
          className={inputClass}
          value={data.assignee}
          onChange={(event) => update({ assignee: event.target.value })}
          placeholder="HR Admin"
          aria-label="Task assignee"
        />
      </FormField>

      <FormField label="Due Date">
        <input
          className={inputClass}
          type="date"
          value={data.dueDate}
          onChange={(event) => update({ dueDate: event.target.value })}
          aria-label="Task due date"
        />
      </FormField>

      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium text-gray-300">Custom Fields</p>
        <button
          type="button"
          onClick={addField}
          className="inline-flex items-center gap-1 rounded-md border border-canvas-border px-2 py-1 text-xs text-gray-200 hover:border-accent-primary hover:text-white"
          aria-label="Add custom field"
        >
          <Plus size={12} /> Add
        </button>
      </div>

      <div className="space-y-2">
        {data.customFields.map((item) => (
          <div key={item.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
            <input
              className={inputClass}
              value={item.key}
              onChange={(event) => updateField(item.id, 'key', event.target.value)}
              placeholder="Key"
              aria-label="Custom field key"
            />
            <input
              className={inputClass}
              value={item.value}
              onChange={(event) => updateField(item.id, 'value', event.target.value)}
              placeholder="Value"
              aria-label="Custom field value"
            />
            <button
              type="button"
              onClick={() => removeField(item.id)}
              className="rounded-md p-2 text-gray-400 hover:bg-red-500/10 hover:text-red-400"
              aria-label="Remove custom field"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
