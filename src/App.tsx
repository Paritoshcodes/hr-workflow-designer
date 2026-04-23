import { useCallback, useEffect, useRef } from 'react'
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { AIPromptBar } from '@/components/AIPromptBar'
import { CritiquePanel } from '@/components/CritiquePanel'
import { GuidedTutorial } from '@/components/GuidedTutorial'
import { NodeFormPanel } from '@/components/forms/NodeFormPanel'
import { nodeTypes } from '@/components/nodes'
import { WorkflowSandbox } from '@/components/sandbox/WorkflowSandbox'
import { DraggableSidebar } from '@/components/sidebar/DraggableSidebar'
import { BottomBar } from '@/components/toolbar/BottomBar'
import { CanvasToolbar } from '@/components/toolbar/CanvasToolbar'
import { useWorkflowStore } from '@/store/workflowStore'
import type { NodeType, WorkflowEdge, WorkflowNode } from '@/types/workflow'

function RightPanel() {
  const rightPanelMode = useWorkflowStore((state) => state.rightPanelMode)
  const selectedNodeId = useWorkflowStore((state) => state.selectedNodeId)
  const isSimulationPanelOpen = useWorkflowStore((state) => state.isSimulationPanelOpen)

  // Show critique panel when explicitly in critique mode
  if (rightPanelMode === 'critique') {
    return <CritiquePanel />
  }

  // Show simulation when panel is open
  if (rightPanelMode === 'simulation' || isSimulationPanelOpen) {
    return <WorkflowSandbox />
  }

  // Show node form when a node is selected
  if (selectedNodeId) {
    return <NodeFormPanel />
  }

  return null
}

function FlowCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const { screenToFlowPosition } = useReactFlow()

  const nodes = useWorkflowStore((state) => state.nodes)
  const edges = useWorkflowStore((state) => state.edges)
  const onNodesChange = useWorkflowStore((state) => state.onNodesChange)
  const onEdgesChange = useWorkflowStore((state) => state.onEdgesChange)
  const onConnect = useWorkflowStore((state) => state.onConnect)
  const addNode = useWorkflowStore((state) => state.addNode)
  const selectNode = useWorkflowStore((state) => state.selectNode)
  const selectedNodeId = useWorkflowStore((state) => state.selectedNodeId)
  const deleteNode = useWorkflowStore((state) => state.deleteNode)
  const clearSuggestions = useWorkflowStore((state) => state.clearSuggestions)
  const setRightPanelMode = useWorkflowStore((state) => state.setRightPanelMode)

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const nodeType = event.dataTransfer.getData('application/reactflow') as NodeType | ''
      if (!nodeType) {
        return
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      addNode(nodeType, position)
    },
    [addNode, screenToFlowPosition]
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const handlePaneClick = useCallback(() => {
    selectNode(null)
    clearSuggestions()
    setRightPanelMode(null)
  }, [selectNode, clearSuggestions, setRightPanelMode])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Delete' && event.key !== 'Backspace') {
        return
      }

      const target = event.target as HTMLElement | null
      const isTypingTarget =
        !!target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)

      if (isTypingTarget || !selectedNodeId) {
        return
      }

      deleteNode(selectedNodeId)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [deleteNode, selectedNodeId])

  return (
    <div ref={reactFlowWrapper} className="relative flex h-full flex-1 flex-col">
      <CanvasToolbar />
      <div data-tutorial="canvas-area" data-cy="workflow-canvas" className="relative h-full" onDrop={onDrop} onDragOver={onDragOver}>
        <AIPromptBar />
        <ReactFlow<WorkflowNode, WorkflowEdge>
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onPaneClick={handlePaneClick}
          onNodeClick={(_, node) => selectNode(node.id)}
          fitView
          className="bg-canvas-bg"
        >
          <MiniMap
            position="top-right"
            style={{ zIndex: 10 }}
            pannable
            zoomable
            nodeStrokeColor="#2A2B32"
            nodeColor="#1C1D22"
            maskColor="rgba(14,15,17,0.6)"
          />
          <Controls showInteractive={false} />
          <Background
            variant={BackgroundVariant.Dots}
            gap={24}
            size={1}
            color="rgba(255,255,255,0.06)"
          />
        </ReactFlow>
        <BottomBar />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ReactFlowProvider>
      <main className="flex h-screen w-screen overflow-hidden bg-canvas-bg font-sans text-white">
        <DraggableSidebar />
        <FlowCanvas />
        <RightPanel />
        <GuidedTutorial />
      </main>
    </ReactFlowProvider>
  )
}
