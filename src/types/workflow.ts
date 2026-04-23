import type { Connection, Edge, EdgeChange, Node, NodeChange } from '@xyflow/react'

export type NodeType = 'start' | 'task' | 'approval' | 'automated' | 'end'

export interface MetadataField {
  id: string
  key: string
  value: string
}

export interface StartNodeData {
  [key: string]: unknown
  type: 'start'
  title: string
  metadata: MetadataField[]
}

export interface TaskNodeData {
  [key: string]: unknown
  type: 'task'
  title: string
  description: string
  assignee: string
  dueDate: string
  customFields: MetadataField[]
}

export interface ApprovalNodeData {
  [key: string]: unknown
  type: 'approval'
  title: string
  approverRole: string
  autoApproveThreshold: number
}

export interface AutomatedNodeData {
  [key: string]: unknown
  type: 'automated'
  title: string
  actionId: string
  actionParams: Record<string, string>
}

export interface EndNodeData {
  [key: string]: unknown
  type: 'end'
  endMessage: string
  showSummary: boolean
}

export type WorkflowNodeData =
  | StartNodeData
  | TaskNodeData
  | ApprovalNodeData
  | AutomatedNodeData
  | EndNodeData

export type WorkflowNode = Node<WorkflowNodeData, NodeType>
export type WorkflowEdge = Edge

export interface Automation {
  id: string
  label: string
  params: string[]
}

export type ValidationErrorCode =
  | 'MISSING_START_NODE'
  | 'MULTIPLE_START_NODES'
  | 'MISSING_END_NODE'
  | 'NO_OUTGOING_EDGE'
  | 'NO_INCOMING_EDGE'
  | 'CYCLE_DETECTED'
  | 'DISCONNECTED_NODE'
  | 'EMPTY_CANVAS'

export interface ValidationError {
  nodeId: string | null
  code: ValidationErrorCode
  message: string
  severity: 'error' | 'warning'
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
}

export type SimulationStatus = 'idle' | 'running' | 'completed' | 'failed'
export type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped'

export interface SimulationStep {
  nodeId: string
  nodeTitle: string
  nodeType: NodeType
  status: StepStatus
  message: string
  timestamp: string
  durationMs: number
}

export interface SimulationResult {
  success: boolean
  steps: SimulationStep[]
  totalDurationMs: number
  error?: string
}

export interface WorkflowMetadata {
  name: string
  description: string
  version: '1.0'
  createdAt: string
  updatedAt: string
}

export interface SerializedWorkflow {
  metadata: WorkflowMetadata
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
}

export interface WorkflowStore {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  selectedNodeId: string | null

  validationResult: ValidationResult | null
  isValidating: boolean

  simulationStatus: SimulationStatus
  simulationSteps: SimulationStep[]
  simulationError: string | null
  isSimulationPanelOpen: boolean

  isGenerating: boolean
  generateError: string | null

  workflowName: string

  onNodesChange: (changes: NodeChange<WorkflowNode>[]) => void
  onEdgesChange: (changes: EdgeChange<WorkflowEdge>[]) => void
  onConnect: (connection: Connection) => void
  addNode: (type: NodeType, position: { x: number; y: number }) => void
  deleteNode: (nodeId: string) => void
  selectNode: (nodeId: string | null) => void
  updateNodeData: (nodeId: string, data: Partial<WorkflowNodeData>) => void

  loadWorkflow: (workflow: Pick<SerializedWorkflow, 'nodes' | 'edges'>) => void
  clearWorkflow: () => void
  setWorkflowName: (name: string) => void

  validate: () => ValidationResult

  setSimulationStatus: (status: SimulationStatus) => void
  setSimulationSteps: (steps: SimulationStep[]) => void
  setSimulationError: (error: string | null) => void
  toggleSimulationPanel: () => void

  setGenerating: (isGenerating: boolean) => void
  setGenerateError: (error: string | null) => void

  // AI highlight (pulsing orange border after generation)
  highlightedNodeIds: string[]
  setHighlightedNodeIds: (ids: string[]) => void
  clearHighlightedNodeIds: () => void

  // Workflow critique
  critiqueResult: CritiqueResult | null
  isCritiquing: boolean
  critiqueError: string | null
  setCritiqueResult: (result: CritiqueResult | null) => void
  setIsCritiquing: (v: boolean) => void
  setCritiqueError: (error: string | null) => void

  // Node suggestions
  suggestions: AISuggestion[]
  suggestionsForNodeId: string | null
  setSuggestions: (suggestions: AISuggestion[], forNodeId: string) => void
  clearSuggestions: () => void

  // Simulation narrative
  simulationNarrative: string
  isNarrating: boolean
  setSimulationNarrative: (text: string) => void
  setIsNarrating: (v: boolean) => void

  // Right panel mode
  rightPanelMode: RightPanelMode
  setRightPanelMode: (mode: RightPanelMode) => void
}

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  icon: string
  workflow: Pick<SerializedWorkflow, 'nodes' | 'edges'>
}

export interface AISuggestion {
  nodeType: NodeType
  title: string
  reason: string
}

export type CritiqueSeverity = 'error' | 'warning' | 'suggestion'

export interface CritiqueIssue {
  nodeId: string
  severity: CritiqueSeverity
  message: string
}

export interface CritiqueResult {
  overallScore: number
  issues: CritiqueIssue[]
  summary: string
}

export type RightPanelMode = 'form' | 'simulation' | 'critique' | null

export type NodeColor = 'WHITE' | 'GRAY' | 'BLACK'

export interface TraversalNode {
  id: string
  color: NodeColor
  order: number
}

export function isStartNode(data: WorkflowNodeData): data is StartNodeData {
  return data.type === 'start'
}

export function isTaskNode(data: WorkflowNodeData): data is TaskNodeData {
  return data.type === 'task'
}

export function isApprovalNode(data: WorkflowNodeData): data is ApprovalNodeData {
  return data.type === 'approval'
}

export function isAutomatedNode(data: WorkflowNodeData): data is AutomatedNodeData {
  return data.type === 'automated'
}

export function isEndNode(data: WorkflowNodeData): data is EndNodeData {
  return data.type === 'end'
}

export function createDefaultNodeData(type: NodeType): WorkflowNodeData {
  switch (type) {
    case 'start':
      return { type: 'start', title: 'Start', metadata: [] }
    case 'task':
      return {
        type: 'task',
        title: 'New Task',
        description: '',
        assignee: '',
        dueDate: '',
        customFields: [],
      }
    case 'approval':
      return {
        type: 'approval',
        title: 'Approval Required',
        approverRole: 'Manager',
        autoApproveThreshold: 0,
      }
    case 'automated':
      return {
        type: 'automated',
        title: 'Automated Step',
        actionId: '',
        actionParams: {},
      }
    case 'end':
      return { type: 'end', endMessage: 'Workflow Complete', showSummary: true }
  }
}
