import type { WorkflowTemplate } from '@/types/workflow'

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'onboarding',
    name: 'New Employee Onboarding',
    description: 'Standard onboarding flow with IT setup and manager approval',
    icon: 'UserPlus',
    workflow: {
      nodes: [
        {
          id: 't1',
          type: 'start',
          position: { x: 300, y: 50 },
          data: {
            type: 'start',
            title: 'Onboarding Start',
            metadata: [{ id: 'm1', key: 'department', value: 'Engineering' }],
          },
        },
        {
          id: 't2',
          type: 'task',
          position: { x: 300, y: 200 },
          data: {
            type: 'task',
            title: 'Collect Documents',
            description: 'Gather ID, address proof, and signed offer letter',
            assignee: 'HR Admin',
            dueDate: '',
            customFields: [],
          },
        },
        {
          id: 't3',
          type: 'automated',
          position: { x: 300, y: 350 },
          data: {
            type: 'automated',
            title: 'Send Welcome Email',
            actionId: 'send_email',
            actionParams: { to: 'new_employee@company.com', subject: 'Welcome to the team!' },
          },
        },
        {
          id: 't4',
          type: 'task',
          position: { x: 300, y: 500 },
          data: {
            type: 'task',
            title: 'IT Setup',
            description: 'Provision laptop, accounts, and access',
            assignee: 'IT Team',
            dueDate: '',
            customFields: [],
          },
        },
        {
          id: 't5',
          type: 'approval',
          position: { x: 300, y: 650 },
          data: {
            type: 'approval',
            title: 'Manager Confirmation',
            approverRole: 'Manager',
            autoApproveThreshold: 0,
          },
        },
        {
          id: 't6',
          type: 'end',
          position: { x: 300, y: 800 },
          data: {
            type: 'end',
            endMessage: 'Employee successfully onboarded!',
            showSummary: true,
          },
        },
      ],
      edges: [
        { id: 'et1-2', source: 't1', target: 't2' },
        { id: 'et2-3', source: 't2', target: 't3' },
        { id: 'et3-4', source: 't3', target: 't4' },
        { id: 'et4-5', source: 't4', target: 't5' },
        { id: 'et5-6', source: 't5', target: 't6' },
      ],
    },
  },
  {
    id: 'leave-approval',
    name: 'Leave Approval',
    description: 'Employee leave request with multi-level approval',
    icon: 'Calendar',
    workflow: {
      nodes: [
        {
          id: 'l1',
          type: 'start',
          position: { x: 300, y: 50 },
          data: { type: 'start', title: 'Leave Request', metadata: [] },
        },
        {
          id: 'l2',
          type: 'task',
          position: { x: 300, y: 200 },
          data: {
            type: 'task',
            title: 'Fill Leave Form',
            description: 'Complete the leave application',
            assignee: 'Employee',
            dueDate: '',
            customFields: [],
          },
        },
        {
          id: 'l3',
          type: 'approval',
          position: { x: 300, y: 350 },
          data: {
            type: 'approval',
            title: 'Manager Approval',
            approverRole: 'Manager',
            autoApproveThreshold: 1,
          },
        },
        {
          id: 'l4',
          type: 'approval',
          position: { x: 300, y: 500 },
          data: {
            type: 'approval',
            title: 'HR Confirmation',
            approverRole: 'HRBP',
            autoApproveThreshold: 0,
          },
        },
        {
          id: 'l5',
          type: 'automated',
          position: { x: 300, y: 650 },
          data: {
            type: 'automated',
            title: 'Notify Employee',
            actionId: 'send_email',
            actionParams: { to: 'employee@company.com', subject: 'Leave Approved' },
          },
        },
        {
          id: 'l6',
          type: 'end',
          position: { x: 300, y: 800 },
          data: {
            type: 'end',
            endMessage: 'Leave approved and recorded.',
            showSummary: false,
          },
        },
      ],
      edges: [
        { id: 'el1-2', source: 'l1', target: 'l2' },
        { id: 'el2-3', source: 'l2', target: 'l3' },
        { id: 'el3-4', source: 'l3', target: 'l4' },
        { id: 'el4-5', source: 'l4', target: 'l5' },
        { id: 'el5-6', source: 'l5', target: 'l6' },
      ],
    },
  },
  {
    id: 'document-verification',
    name: 'Document Verification',
    description: 'Background check and document validation process',
    icon: 'FileCheck',
    workflow: {
      nodes: [
        {
          id: 'd1',
          type: 'start',
          position: { x: 300, y: 50 },
          data: { type: 'start', title: 'Document Submission', metadata: [] },
        },
        {
          id: 'd2',
          type: 'task',
          position: { x: 300, y: 200 },
          data: {
            type: 'task',
            title: 'Upload Documents',
            description: 'ID proof, address verification, certificates',
            assignee: 'Employee',
            dueDate: '',
            customFields: [],
          },
        },
        {
          id: 'd3',
          type: 'automated',
          position: { x: 300, y: 350 },
          data: {
            type: 'automated',
            title: 'Generate Verification Report',
            actionId: 'generate_doc',
            actionParams: { template: 'background_check', recipient: 'HR Team' },
          },
        },
        {
          id: 'd4',
          type: 'approval',
          position: { x: 300, y: 500 },
          data: {
            type: 'approval',
            title: 'HR Verification',
            approverRole: 'HRBP',
            autoApproveThreshold: 0,
          },
        },
        {
          id: 'd5',
          type: 'automated',
          position: { x: 300, y: 650 },
          data: {
            type: 'automated',
            title: 'Update HRIS',
            actionId: 'update_hris',
            actionParams: { employeeId: '', field: 'bgv_status', value: 'verified' },
          },
        },
        {
          id: 'd6',
          type: 'end',
          position: { x: 300, y: 800 },
          data: {
            type: 'end',
            endMessage: 'Documents verified and recorded.',
            showSummary: true,
          },
        },
      ],
      edges: [
        { id: 'ed1-2', source: 'd1', target: 'd2' },
        { id: 'ed2-3', source: 'd2', target: 'd3' },
        { id: 'ed3-4', source: 'd3', target: 'd4' },
        { id: 'ed4-5', source: 'd4', target: 'd5' },
        { id: 'ed5-6', source: 'd5', target: 'd6' },
      ],
    },
  },
]
