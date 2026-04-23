import clsx from 'clsx'
import {
  BarChart3,
  BookOpen,
  ChevronDown,
  ClipboardList,
  CheckCircle,
  Flag,
  Folders,
  GraduationCap,
  HelpCircle,
  Inbox,
  LayoutDashboard,
  Link2,
  MessageSquare,
  Play,
  CalendarClock,
  Settings,
  ShieldCheck,
  Users,
  Workflow,
  Zap,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import type { NodeType } from '@/types/workflow'

interface NavItem {
  label: string
  icon: ReactNode
  active?: boolean
}

interface NavSection {
  title: string
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'General',
    items: [
      { label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
      { label: 'Compliance', icon: <ShieldCheck size={16} /> },
      { label: 'Scheduler', icon: <CalendarClock size={16} /> },
      { label: 'Analytics', icon: <BarChart3 size={16} /> },
    ],
  },
  {
    title: 'Automation',
    items: [
      { label: 'Integrations', icon: <Link2 size={16} /> },
      { label: 'Repository', icon: <Folders size={16} /> },
      { label: 'Workflows', icon: <Workflow size={16} />, active: true },
    ],
  },
  {
    title: 'Resources',
    items: [
      { label: 'Member', icon: <Users size={16} /> },
      { label: 'Inbox', icon: <Inbox size={16} /> },
      { label: 'Messages', icon: <MessageSquare size={16} /> },
    ],
  },
]

const NODE_TYPES: {
  type: NodeType
  label: string
  description: string
  icon: ReactNode
  colorClass: string
}[] = [
  {
    type: 'start',
    label: 'Start',
    description: 'Workflow entry point',
    icon: <Play size={14} />,
    colorClass: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
  },
  {
    type: 'task',
    label: 'Task',
    description: 'Human action required',
    icon: <ClipboardList size={14} />,
    colorClass: 'text-sky-400 border-sky-500/40 bg-sky-500/10',
  },
  {
    type: 'approval',
    label: 'Approval',
    description: 'Requires sign-off',
    icon: <CheckCircle size={14} />,
    colorClass: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
  },
  {
    type: 'automated',
    label: 'Automated',
    description: 'System-triggered action',
    icon: <Zap size={14} />,
    colorClass: 'text-violet-400 border-violet-500/40 bg-violet-500/10',
  },
  {
    type: 'end',
    label: 'End',
    description: 'Workflow completion',
    icon: <Flag size={14} />,
    colorClass: 'text-rose-400 border-rose-500/40 bg-rose-500/10',
  },
]

export function DraggableSidebar() {
  const [expandedSection, setExpandedSection] = useState<string | null>('Automation')

  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r border-canvas-border bg-surface-sidebar">
      {/* Logo / Brand */}
      <div className="border-b border-canvas-border px-5 py-5">
        <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-accent-orange">
          Tredence Studio
        </p>
        <h1 className="mt-1.5 text-lg font-semibold leading-tight text-white">
          HR Workflow Designer
        </h1>
        <button
          type="button"
          data-tutorial="tutorial-btn"
          onClick={() => {
            const fn = (window as unknown as { __openTutorial?: () => void }).__openTutorial
            if (fn) fn()
          }}
          className="mt-3 flex items-center gap-1.5 rounded-lg border border-accent-orange/40 px-3 py-1.5 text-[11px] font-medium text-accent-orange transition-colors hover:bg-accent-orange/10"
        >
          <GraduationCap size={13} /> Tutorial
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="mb-1">
            <button
              type="button"
              onClick={() =>
                setExpandedSection(expandedSection === section.title ? null : section.title)
              }
              className="flex w-full items-center justify-between px-5 py-2 text-[10px] font-medium uppercase tracking-[0.2em] text-accent-secondary hover:text-white"
            >
              {section.title}
              <ChevronDown
                size={12}
                className={clsx(
                  'transition-transform',
                  expandedSection === section.title && 'rotate-180'
                )}
              />
            </button>
            {expandedSection === section.title && (
              <div className="space-y-0.5 px-2">
                {section.items.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    className={clsx(
                      'flex w-full items-center gap-3 rounded-md px-3 py-2 text-[13px] transition-colors',
                      item.active
                        ? 'border-l-2 border-accent-orange bg-accent-orange/10 font-medium text-accent-orange'
                        : 'border-l-2 border-transparent text-zinc-400 hover:bg-canvas-surface hover:text-white'
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Node Palette */}
        <div data-tutorial="node-palette" className="border-t border-canvas-border px-4 pt-3 mt-2">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-accent-secondary">
            Node Palette
          </p>
          <div className="space-y-1.5">
            {NODE_TYPES.map((item) => (
              <button
                key={item.type}
                data-cy={`sidebar-node-${item.type}`}
                data-tutorial={item.type === 'task' ? 'node-card-task' : undefined}
                draggable
                onDragStart={(event) => onDragStart(event, item.type)}
                className={clsx(
                  'ui-transition w-full rounded-lg border border-canvas-border bg-canvas-bg/50 p-2.5 text-left',
                  'hover:border-accent-orange/50 active:cursor-grabbing'
                )}
                aria-label={`Drag ${item.label} node`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={clsx(
                      'flex h-7 w-7 items-center justify-center rounded-md border',
                      item.colorClass
                    )}
                  >
                    {item.icon}
                  </span>
                  <div>
                    <p className="text-xs font-medium text-white">{item.label}</p>
                    <p className="text-[10px] text-zinc-500">{item.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Bottom links */}
      <div className="border-t border-canvas-border px-4 py-3 space-y-1">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-[13px] text-zinc-500 hover:bg-canvas-surface hover:text-white"
        >
          <Settings size={14} /> Settings
        </button>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-[13px] text-zinc-500 hover:bg-canvas-surface hover:text-white"
        >
          <HelpCircle size={14} /> Help & Support
        </button>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-[13px] text-zinc-500 hover:bg-canvas-surface hover:text-white"
        >
          <BookOpen size={14} /> Documentation
        </button>
      </div>
    </aside>
  )
}
