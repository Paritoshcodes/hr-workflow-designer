import { addEdge, applyEdgeChanges, applyNodeChanges } from '@xyflow/react'
import type { Connection, EdgeChange, NodeChange } from '@xyflow/react'
import { nanoid } from 'nanoid'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import {
  createDefaultNodeData,
  type AISuggestion,
  type CritiqueResult,
  type NodeType,
  type RightPanelMode,
  type SimulationStatus,
  type SimulationStep,
  type ValidationResult,
  type WorkflowNode,
  type WorkflowNodeData,
  type WorkflowStore,
} from '@/types/workflow'
import { validateWorkflow } from '@/utils/graphTraversal'

export const useWorkflowStore = create<WorkflowStore>()(
  devtools(
    (set, get) => ({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      validationResult: null,
      isValidating: false,
      simulationStatus: 'idle',
      simulationSteps: [],
      simulationError: null,
      isSimulationPanelOpen: false,
      isGenerating: false,
      generateError: null,
      workflowName: 'Untitled Workflow',

      onNodesChange: (changes: NodeChange<WorkflowNode>[]) => {
        set((state) => ({ nodes: applyNodeChanges<WorkflowNode>(changes, state.nodes) }))
      },

      onEdgesChange: (changes: EdgeChange[]) => {
        set((state) => ({ edges: applyEdgeChanges(changes, state.edges) }))
      },

      onConnect: (connection: Connection) => {
        set((state) => ({
          edges: addEdge(
            {
              ...connection,
              type: 'smoothstep',
              animated: true,
            },
            state.edges
          ),
        }))
      },

      addNode: (type: NodeType, position: { x: number; y: number }) => {
        const newNode: WorkflowNode = {
          id: nanoid(8),
          type,
          position,
          data: createDefaultNodeData(type),
        }

        set((state) => ({ nodes: [...state.nodes, newNode] }))
      },

      deleteNode: (nodeId: string) => {
        set((state) => ({
          nodes: state.nodes.filter((node) => node.id !== nodeId),
          edges: state.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
          selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
        }))
      },

      selectNode: (nodeId: string | null) => {
        set({ selectedNodeId: nodeId })
      },

      updateNodeData: (nodeId: string, data: Partial<WorkflowNodeData>) => {
        set((state) => ({
          nodes: state.nodes.map((node) => {
            if (node.id !== nodeId) {
              return node
            }

            return {
              ...node,
              data: {
                ...node.data,
                ...data,
              } as WorkflowNodeData,
            }
          }),
        }))
      },

      loadWorkflow: ({ nodes, edges }) => {
        set({
          nodes,
          edges,
          selectedNodeId: null,
          validationResult: null,
          simulationStatus: 'idle',
          simulationSteps: [],
          simulationError: null,
        })
      },

      clearWorkflow: () => {
        set({
          nodes: [],
          edges: [],
          selectedNodeId: null,
          validationResult: null,
          simulationStatus: 'idle',
          simulationSteps: [],
          simulationError: null,
        })
      },

      setWorkflowName: (name: string) => set({ workflowName: name }),

      validate: (): ValidationResult => {
        set({ isValidating: true })
        const { nodes, edges } = get()
        const result = validateWorkflow(nodes, edges)
        set({ validationResult: result, isValidating: false })
        return result
      },

      setSimulationStatus: (status: SimulationStatus) => set({ simulationStatus: status }),

      setSimulationSteps: (steps: SimulationStep[]) => set({ simulationSteps: steps }),

      setSimulationError: (error: string | null) => set({ simulationError: error }),

      toggleSimulationPanel: () =>
        set((state) => ({ isSimulationPanelOpen: !state.isSimulationPanelOpen })),

      setGenerating: (isGenerating: boolean) => set({ isGenerating }),
      setGenerateError: (error: string | null) => set({ generateError: error }),

      // AI highlight
      highlightedNodeIds: [],
      setHighlightedNodeIds: (ids: string[]) => set({ highlightedNodeIds: ids }),
      clearHighlightedNodeIds: () => set({ highlightedNodeIds: [] }),

      // Critique
      critiqueResult: null,
      isCritiquing: false,
      critiqueError: null,
      setCritiqueResult: (result: CritiqueResult | null) => set({ critiqueResult: result }),
      setIsCritiquing: (v: boolean) => set({ isCritiquing: v }),
      setCritiqueError: (error: string | null) => set({ critiqueError: error }),

      // Suggestions
      suggestions: [] as AISuggestion[],
      suggestionsForNodeId: null,
      setSuggestions: (suggestions: AISuggestion[], forNodeId: string) =>
        set({ suggestions, suggestionsForNodeId: forNodeId }),
      clearSuggestions: () => set({ suggestions: [], suggestionsForNodeId: null }),

      // Narrative
      simulationNarrative: '',
      isNarrating: false,
      setSimulationNarrative: (text: string) => set({ simulationNarrative: text }),
      setIsNarrating: (v: boolean) => set({ isNarrating: v }),

      // Right panel
      rightPanelMode: null as RightPanelMode,
      setRightPanelMode: (mode: RightPanelMode) => set({ rightPanelMode: mode }),
    }),
    { name: 'workflow-store' }
  )
)
