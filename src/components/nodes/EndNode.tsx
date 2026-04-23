import type { NodeProps } from '@xyflow/react'
import { Flag } from 'lucide-react'
import type { EndNodeData, WorkflowNode } from '@/types/workflow'
import { BaseNode } from './BaseNode'

export function EndNode({ id, data, selected }: NodeProps<WorkflowNode>) {
  const nodeData = data as EndNodeData

  const badges = []
  if (nodeData.showSummary) {
    badges.push({ label: 'Summary on' })
  }

  return (
    <BaseNode
      id={id}
      data={nodeData}
      selected={selected}
      accentColor="bg-rose-500"
      icon={<Flag size={13} className="text-rose-400" />}
      hasSource={false}
      badges={badges}
    />
  )
}
