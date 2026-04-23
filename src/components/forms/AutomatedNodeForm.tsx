import { useQuery } from '@tanstack/react-query'
import { fetchAutomations } from '@/api/workflowApi'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { useWorkflowStore } from '@/store/workflowStore'
import type { AutomatedNodeData } from '@/types/workflow'
import { FormField } from './FormPrimitives'
import { inputClass } from './FormStyles'

interface Props {
  nodeId: string
  data: AutomatedNodeData
}

export function AutomatedNodeForm({ nodeId, data }: Props) {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData)
  const { data: automations = [] } = useQuery({
    queryKey: ['automations'],
    queryFn: fetchAutomations,
    staleTime: 60_000,
  })

  const update = (partial: Partial<AutomatedNodeData>) => {
    updateNodeData(nodeId, partial)
  }

  const automationOptions = automations.map((automation) => ({
    value: automation.id,
    label: automation.label,
  }))

  const selectedAutomation = automations.find((item) => item.id === data.actionId)

  const handleActionChange = (actionId: string) => {
    update({ actionId, actionParams: {} })
  }

  const handleParamChange = (paramKey: string, value: string) => {
    update({
      actionParams: {
        ...data.actionParams,
        [paramKey]: value,
      },
    })
  }

  return (
    <div>
      <FormField label="Title *">
        <input
          className={inputClass}
          value={data.title}
          onChange={(event) => update({ title: event.target.value })}
          placeholder="Automated step title"
          aria-label="Automated title"
        />
      </FormField>

      <FormField label="Automation Action">
        <CustomSelect
          value={data.actionId}
          options={automationOptions}
          onChange={handleActionChange}
          placeholder="Select an action"
          ariaLabel="Automation action"
          dataCy="automation-action-select"
        />
      </FormField>

      {selectedAutomation?.params.map((param) => (
        <FormField key={param} label={param.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}>
          <input
            className={inputClass}
            value={data.actionParams[param] ?? ''}
            onChange={(event) => handleParamChange(param, event.target.value)}
            placeholder={`Enter ${param}`}
            aria-label={`Automation parameter ${param}`}
          />
        </FormField>
      ))}
    </div>
  )
}
