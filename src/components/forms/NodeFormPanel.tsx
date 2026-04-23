import {
  CheckCircle,
  ClipboardList,
  Flag,
  Play,
  X,
  Zap,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useWorkflowStore } from '@/store/workflowStore'
import type {
  ApprovalNodeData,
  AutomatedNodeData,
  EndNodeData,
  NodeType,
  StartNodeData,
  TaskNodeData,
  WorkflowNodeData,
} from '@/types/workflow'
import { ApprovalNodeForm } from './ApprovalNodeForm'
import { AutomatedNodeForm } from './AutomatedNodeForm'
import { EndNodeForm } from './EndNodeForm'
import { StartNodeForm } from './StartNodeForm'
import { TaskNodeForm } from './TaskNodeForm'

const NODE_META: Record<NodeType, { icon: ReactNode; label: string; colorClass: string }> = {
  start: { icon: <Play size={14} />, label: 'Start Node', colorClass: 'text-emerald-400' },
  task: { icon: <ClipboardList size={14} />, label: 'Task Node', colorClass: 'text-sky-400' },
  approval: { icon: <CheckCircle size={14} />, label: 'Approval Node', colorClass: 'text-amber-400' },
  automated: { icon: <Zap size={14} />, label: 'Automated Node', colorClass: 'text-violet-400' },
  end: { icon: <Flag size={14} />, label: 'End Node', colorClass: 'text-rose-400' },
}

function getFormForType(nodeId: string, data: WorkflowNodeData) {
  switch (data.type) {
    case 'start':
      return <StartNodeForm nodeId={nodeId} data={data as StartNodeData} />
    case 'task':
      return <TaskNodeForm nodeId={nodeId} data={data as TaskNodeData} />
    case 'approval':
      return <ApprovalNodeForm nodeId={nodeId} data={data as ApprovalNodeData} />
    case 'automated':
      return <AutomatedNodeForm nodeId={nodeId} data={data as AutomatedNodeData} />
    case 'end':
      return <EndNodeForm nodeId={nodeId} data={data as EndNodeData} />
  }
}

export function NodeFormPanel() {
  const selectedNodeId = useWorkflowStore((state) => state.selectedNodeId)
  const nodes = useWorkflowStore((state) => state.nodes)
  const selectNode = useWorkflowStore((state) => state.selectNode)

  if (!selectedNodeId) return null

  const node = nodes.find((n) => n.id === selectedNodeId)
  if (!node) return null

  const meta = NODE_META[node.data.type]

  return (
    <aside
      data-cy="node-form-panel"
      className="ui-slide-in-right flex h-full w-[300px] flex-col border-l border-canvas-border bg-canvas-surface"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-canvas-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={meta.colorClass}>{meta.icon}</span>
          <p className="text-sm font-semibold text-white">{meta.label}</p>
        </div>
        <button
          type="button"
          onClick={() => selectNode(null)}
          className="ui-transition rounded-md p-1 text-zinc-400 hover:bg-canvas-bg hover:text-white"
          aria-label="Close panel"
        >
          <X size={14} />
        </button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4">
        {getFormForType(selectedNodeId, node.data)}
      </div>
    </aside>
  )
}
