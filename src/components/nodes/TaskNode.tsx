import type { NodeProps } from '@xyflow/react'
import { ClipboardList, Calendar, User } from 'lucide-react'
import type { TaskNodeData, WorkflowNode } from '@/types/workflow'
import { BaseNode } from './BaseNode'

export function TaskNode({ id, data, selected }: NodeProps<WorkflowNode>) {
  const nodeData = data as TaskNodeData

  const badges = []
  if (nodeData.assignee) {
    badges.push({
      label: nodeData.assignee.slice(0, 2).toUpperCase(),
      icon: <User size={9} />,
    })
  }
  if (nodeData.dueDate) {
    badges.push({
      label: nodeData.dueDate,
      icon: <Calendar size={9} />,
    })
  }
  if (nodeData.customFields.length > 0) {
    badges.push({ label: `${nodeData.customFields.length} fields` })
  }

  return (
    <BaseNode
      id={id}
      data={nodeData}
      selected={selected}
      accentColor="bg-sky-500"
      icon={<ClipboardList size={13} className="text-sky-400" />}
      badges={badges}
    >
      {nodeData.description && (
        <p className="line-clamp-2">{nodeData.description}</p>
      )}
    </BaseNode>
  )
}
