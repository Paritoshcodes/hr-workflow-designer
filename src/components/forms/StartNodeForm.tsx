import { Plus, X } from 'lucide-react'
import { nanoid } from 'nanoid'
import { useWorkflowStore } from '@/store/workflowStore'
import type { StartNodeData } from '@/types/workflow'
import { FormField } from './FormPrimitives'
import { inputClass } from './FormStyles'

interface Props {
  nodeId: string
  data: StartNodeData
}

export function StartNodeForm({ nodeId, data }: Props) {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData)

  const update = (partial: Partial<StartNodeData>) => {
    updateNodeData(nodeId, partial)
  }

  const addMetadata = () => {
    update({ metadata: [...data.metadata, { id: nanoid(4), key: '', value: '' }] })
  }

  const removeMetadata = (id: string) => {
    update({ metadata: data.metadata.filter((item) => item.id !== id) })
  }

  const updateMetadata = (id: string, field: 'key' | 'value', value: string) => {
    update({
      metadata: data.metadata.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    })
  }

  return (
    <div>
      <FormField label="Title *">
        <input
          className={inputClass}
          value={data.title}
          onChange={(event) => update({ title: event.target.value })}
          placeholder="Start step title"
          aria-label="Start title"
        />
      </FormField>

      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium text-gray-300">Metadata</p>
        <button
          type="button"
          onClick={addMetadata}
          className="inline-flex items-center gap-1 rounded-md border border-canvas-border px-2 py-1 text-xs text-gray-200 hover:border-accent-primary hover:text-white"
          aria-label="Add metadata field"
        >
          <Plus size={12} /> Add
        </button>
      </div>

      <div className="space-y-2">
        {data.metadata.map((item) => (
          <div key={item.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
            <input
              className={inputClass}
              value={item.key}
              onChange={(event) => updateMetadata(item.id, 'key', event.target.value)}
              placeholder="Key"
              aria-label="Metadata key"
            />
            <input
              className={inputClass}
              value={item.value}
              onChange={(event) => updateMetadata(item.id, 'value', event.target.value)}
              placeholder="Value"
              aria-label="Metadata value"
            />
            <button
              type="button"
              onClick={() => removeMetadata(item.id)}
              className="rounded-md p-2 text-gray-400 hover:bg-red-500/10 hover:text-red-400"
              aria-label="Remove metadata field"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
