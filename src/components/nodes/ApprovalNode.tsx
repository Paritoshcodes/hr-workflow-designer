import type { NodeProps } from '@xyflow/react'
import { CheckCircle } from 'lucide-react'
import type { ApprovalNodeData, WorkflowNode } from '@/types/workflow'
import { BaseNode } from './BaseNode'

export function ApprovalNode({ id, data, selected }: NodeProps<WorkflowNode>) {
  const nodeData = data as ApprovalNodeData

  const badges = [{ label: nodeData.approverRole }]
  if (nodeData.autoApproveThreshold > 0) {
    badges.push({ label: `${nodeData.autoApproveThreshold}d auto` })
  }

  return (
    <BaseNode
      id={id}
      data={nodeData}
      selected={selected}
      accentColor="bg-amber-500"
      icon={<CheckCircle size={13} className="text-amber-400" />}
      badges={badges}
    />
  )
}
