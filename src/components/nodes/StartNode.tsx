import type { NodeProps } from '@xyflow/react'
import { Play } from 'lucide-react'
import type { StartNodeData, WorkflowNode } from '@/types/workflow'
import { BaseNode } from './BaseNode'

export function StartNode({ id, data, selected }: NodeProps<WorkflowNode>) {
  const nodeData = data as StartNodeData

  const badges = []
  if (nodeData.metadata.length > 0) {
    badges.push({ label: `${nodeData.metadata.length} metadata` })
  }

  return (
    <BaseNode
      id={id}
      data={nodeData}
      selected={selected}
      accentColor="bg-emerald-500"
      icon={<Play size={13} className="text-emerald-400" />}
      hasTarget={false}
      badges={badges}
    />
  )
}
