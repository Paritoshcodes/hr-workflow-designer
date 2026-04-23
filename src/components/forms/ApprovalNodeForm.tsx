import { useWorkflowStore } from '@/store/workflowStore'
import type { ApprovalNodeData } from '@/types/workflow'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { FormField } from './FormPrimitives'
import { inputClass } from './FormStyles'

const APPROVER_ROLES = ['Manager', 'HRBP', 'Director', 'VP', 'CEO']
const APPROVER_ROLE_OPTIONS = APPROVER_ROLES.map((role) => ({ value: role, label: role }))

interface Props {
  nodeId: string
  data: ApprovalNodeData
}

export function ApprovalNodeForm({ nodeId, data }: Props) {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData)

  const update = (partial: Partial<ApprovalNodeData>) => {
    updateNodeData(nodeId, partial)
  }

  return (
    <div>
      <FormField label="Title *">
        <input
          className={inputClass}
          value={data.title}
          onChange={(event) => update({ title: event.target.value })}
          placeholder="Approval title"
          aria-label="Approval title"
        />
      </FormField>

      <FormField label="Approver Role">
        <CustomSelect
          value={data.approverRole}
          options={APPROVER_ROLE_OPTIONS}
          onChange={(value) => update({ approverRole: value })}
          ariaLabel="Approver role"
          dataCy="approval-role-select"
        />
      </FormField>

      <FormField label="Auto-Approve Threshold (days)">
        <input
          className={inputClass}
          type="number"
          min={0}
          value={data.autoApproveThreshold}
          onChange={(event) => update({ autoApproveThreshold: Number(event.target.value) || 0 })}
          aria-label="Auto approve threshold"
        />
      </FormField>
    </div>
  )
}
