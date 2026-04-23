import type { NodeProps } from '@xyflow/react'
import { Zap } from 'lucide-react'
import type { AutomatedNodeData, WorkflowNode } from '@/types/workflow'
import { BaseNode } from './BaseNode'

export function AutomatedNode({ id, data, selected }: NodeProps<WorkflowNode>) {
  const nodeData = data as AutomatedNodeData

  const badges = []
  if (nodeData.actionId) {
    badges.push({ label: nodeData.actionId })
  }

  return (
    <BaseNode
      id={id}
      data={nodeData}
      selected={selected}
      accentColor="bg-violet-500"
      icon={<Zap size={13} className="text-violet-400" />}
      badges={badges}
    />
  )
}
