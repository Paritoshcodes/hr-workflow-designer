import clsx from 'clsx'
import { Sparkles, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

/* ─── Tutorial Steps ──────────────────────────────────────────────────────── */

interface TutorialStep {
  title: string
  description: string
  /**
   * CSS selector of the element to highlight.
   * If null, the tooltip is centered on the canvas without highlight.
   */
  highlightSelector: string | null
  /**
   * Where to anchor the tooltip relative to the highlighted element.
   * 'center' = center of viewport (no highlight case).
   */
  tooltipPosition: 'right' | 'bottom' | 'top' | 'center'
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: 'Welcome to Tredence Studio',
    description:
      'This guided tour walks you through every feature of the HR Workflow Designer. Anytime you need a refresher, click the Tutorial button in the sidebar to replay it.',
    highlightSelector: null,
    tooltipPosition: 'center',
  },
  {
    title: 'Node Palette',
    description:
      'These are your workflow building blocks. Start, Task, Approval, Automated, and End nodes. Drag any card onto the canvas to create a step.',
    highlightSelector: '[data-tutorial="node-palette"]',
    tooltipPosition: 'right',
  },
  {
    title: 'Drag & Drop',
    description:
      'Grab any node card from the palette and drop it onto the canvas. Each card maps to a different workflow action type — from human tasks to automated actions.',
    highlightSelector: '[data-tutorial="node-card-task"]',
    tooltipPosition: 'right',
  },
  {
    title: 'AI Workflow Generator',
    description:
      'Type a natural-language description and hit Generate. The AI will create a complete, production-ready workflow graph in seconds — with proper approval chains, notifications, and documentation steps.',
    highlightSelector: '[data-cy="ai-prompt-bar"]',
    tooltipPosition: 'bottom',
  },
  {
    title: 'Workflow Controls',
    description:
      'Validate your graph for errors, auto-layout nodes with Dagre, and run a full simulation — all from the bottom toolbar. The Simulate button executes each step and shows a timeline.',
    highlightSelector: '[data-tutorial="bottom-bar"]',
    tooltipPosition: 'top',
  },
  {
    title: 'AI Critique Agent',
    description:
      'Click Critique in the top toolbar. The AI audits your workflow against HR best practices, returns a 0-100 score, and highlights specific issues. Click any issue to pan to the problematic node.',
    highlightSelector: '[data-tutorial="critique-btn"]',
    tooltipPosition: 'bottom',
  },
  {
    title: 'Node Inspector',
    description:
      'Click any node on the canvas to open its property panel on the right. Edit titles, assignees, approval roles, action IDs, and custom fields — changes update the graph in real time.',
    highlightSelector: '[data-tutorial="canvas-area"]',
    tooltipPosition: 'center',
  },
  {
    title: 'Save & Import',
    description:
      'Use the Save button to download your workflow as JSON. Use Import to load a previously saved workflow. Your designs are portable and version-controllable.',
    highlightSelector: '[data-tutorial="toolbar-actions"]',
    tooltipPosition: 'bottom',
  },
  {
    title: 'Simulation Narrator',
    description:
      'After a simulation completes, click "Generate Narrative" in the simulation panel. The AI streams a step-by-step story of what happened, surfacing delays and bottlenecks.',
    highlightSelector: '[data-tutorial="simulate-btn"]',
    tooltipPosition: 'top',
  },
  {
    title: 'You\'re All Set!',
    description:
      'Start by typing a prompt in the AI bar or drag a Start node onto the canvas. Build workflows, critique them with AI, simulate runs, and iterate. Happy designing!',
    highlightSelector: null,
    tooltipPosition: 'center',
  },
]

const TUTORIAL_STORAGE_KEY = 'hr-workflow-tutorial-seen'

/* ─── Component ───────────────────────────────────────────────────────────── */

export function GuidedTutorial() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null)

  // Show on first visit
  useEffect(() => {
    const seen = localStorage.getItem(TUTORIAL_STORAGE_KEY)
    if (!seen) {
      // Small delay so the page has time to render
      const timer = setTimeout(() => setIsOpen(true), 800)
      return () => clearTimeout(timer)
    }
  }, [])

  // Find and measure the highlighted element
  useEffect(() => {
    if (!isOpen) return

    const measure = () => {
      const step = TUTORIAL_STEPS[currentStep]
      if (!step.highlightSelector) {
        setHighlightRect(null)
        return
      }

      const el = document.querySelector(step.highlightSelector)
      if (el) {
        setHighlightRect(el.getBoundingClientRect())
      } else {
        setHighlightRect(null)
      }
    }

    measure()
    window.addEventListener('resize', measure)
    const timer = setTimeout(measure, 150) // catch post-render layout shifts
    return () => {
      window.removeEventListener('resize', measure)
      clearTimeout(timer)
    }
  }, [isOpen, currentStep])

  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  })

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setCurrentStep(0)
    localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true')
  }, [])

  const next = useCallback(() => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep((s) => s + 1)
    } else {
      close()
    }
  }, [currentStep, close])

  const prev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1)
    }
  }, [currentStep])

  // Public method to re-open
  const open = useCallback(() => {
    setCurrentStep(0)
    setIsOpen(true)
  }, [])

  // Expose open function globally so the sidebar button can trigger it
  useEffect(() => {
    ;(window as unknown as { __openTutorial?: () => void }).__openTutorial = open
    return () => {
      delete (window as unknown as { __openTutorial?: () => void }).__openTutorial
    }
  }, [open])

  if (!isOpen) return null

  const step = TUTORIAL_STEPS[currentStep]
  const totalSteps = TUTORIAL_STEPS.length
  const progress = ((currentStep + 1) / totalSteps) * 100

  const getCutout = () => {
    if (!highlightRect) {
      return {
        top: windowSize.height / 2,
        left: windowSize.width / 2,
        width: 0,
        height: 0,
      }
    }

    const pad = 6
    const top = Math.max(0, highlightRect.top - pad)
    const left = Math.max(0, highlightRect.left - pad)
    const width = Math.min(windowSize.width - left, highlightRect.width + pad * 2)
    const height = Math.min(windowSize.height - top, highlightRect.height + pad * 2)

    return { top, left, width, height }
  }

  const cutout = getCutout()

  // Calculate tooltip position
  const getTooltipStyle = (): React.CSSProperties => {
    const tooltipWidth = 360
    const tooltipHeight = 220 // rough estimate

    let top = windowSize.height / 2 - tooltipHeight / 2
    let left = windowSize.width / 2 - tooltipWidth / 2

    if (step.tooltipPosition !== 'center' && highlightRect) {
      const pad = 16
      switch (step.tooltipPosition) {
        case 'right':
          top = Math.max(pad, highlightRect.top)
          left = highlightRect.right + pad
          // If right clips, try placing on the left
          if (left + tooltipWidth > windowSize.width - pad) {
            left = highlightRect.left - tooltipWidth - pad
          }
          break
        case 'bottom':
          top = highlightRect.bottom + pad
          // Center it horizontally relative to the highlight, but constrain to viewport
          left = highlightRect.left + highlightRect.width / 2 - tooltipWidth / 2
          left = Math.max(pad, Math.min(windowSize.width - tooltipWidth - pad, left))
          // If bottom clips, try top
          if (top + tooltipHeight > windowSize.height - pad) {
            top = highlightRect.top - tooltipHeight - pad
          }
          break
        case 'top':
          top = highlightRect.top - tooltipHeight - pad
          // Center it horizontally relative to the highlight, but constrain to viewport
          left = highlightRect.left + highlightRect.width / 2 - tooltipWidth / 2
          left = Math.max(pad, Math.min(windowSize.width - tooltipWidth - pad, left))
          // If top clips, try bottom
          if (top < pad) {
            top = highlightRect.bottom + pad
          }
          break
      }
    }

    // Final safety constraint to ensure it NEVER clips viewport
    top = Math.max(8, Math.min(windowSize.height - tooltipHeight - 8, top))
    left = Math.max(8, Math.min(windowSize.width - tooltipWidth - 8, left))

    return {
      top,
      left,
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999]" aria-modal="true" role="dialog">
      {/* Backdrop — darkened overlay with blur */}
      <div className="absolute inset-0" onClick={close}>
        <div
          className="tutorial-backdrop"
          style={{
            top: 0,
            left: 0,
            width: windowSize.width,
            height: cutout.top,
          }}
        />
        <div
          className="tutorial-backdrop"
          style={{
            top: cutout.top,
            left: 0,
            width: cutout.left,
            height: cutout.height,
          }}
        />
        <div
          className="tutorial-backdrop"
          style={{
            top: cutout.top,
            left: cutout.left + cutout.width,
            width: windowSize.width - (cutout.left + cutout.width),
            height: cutout.height,
          }}
        />
        <div
          className="tutorial-backdrop"
          style={{
            top: cutout.top + cutout.height,
            left: 0,
            width: windowSize.width,
            height: windowSize.height - (cutout.top + cutout.height),
          }}
        />
      </div>

      {/* Highlight cutout ring */}
      <div
        className={clsx(
          "absolute z-[10000] rounded-lg ring-2 ring-accent-orange pointer-events-none tutorial-highlight",
          "shadow-[0_0_20px_rgba(249,115,22,0.3)]",
          !highlightRect && "opacity-0 scale-95"
        )}
        style={{
          top: cutout.top,
          left: cutout.left,
          width: cutout.width,
          height: cutout.height,
        }}
      />

      {/* Tooltip card */}
      <div
        className="absolute z-[10001] w-[360px] rounded-xl border border-canvas-border bg-[#1A1B20]/95 backdrop-blur-xl p-5 shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={getTooltipStyle()}
      >
        {/* Header badge */}
        <div className="mb-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-canvas-border bg-canvas-bg px-3 py-1 text-[10px] font-medium tracking-wider text-zinc-300 uppercase">
            <Sparkles size={11} className="text-accent-orange" />
            Guided Tutorial
          </span>
          <button
            type="button"
            onClick={close}
            className="ui-transition rounded-md p-1 text-zinc-500 hover:bg-canvas-bg hover:text-white"
            aria-label="Close tutorial"
          >
            <X size={14} />
          </button>
        </div>

        {/* Step counter */}
        <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.15em] text-zinc-500">
          Step {currentStep + 1} of {totalSteps}
        </p>

        {/* Title */}
        <h3 className="mb-2 text-base font-bold text-white">{step.title}</h3>

        {/* Description */}
        <p className="mb-4 text-sm leading-relaxed text-zinc-400">{step.description}</p>

        {/* Progress bar */}
        <div className="mb-4 h-1 w-full overflow-hidden rounded-full bg-canvas-bg">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent-orange to-orange-400 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2">
          {currentStep > 0 && (
            <button
              type="button"
              onClick={prev}
              className="ui-transition rounded-lg border border-canvas-border px-4 py-1.5 text-xs text-zinc-400 hover:border-zinc-500 hover:text-white"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={close}
            className="ui-transition rounded-lg border border-canvas-border px-4 py-1.5 text-xs text-zinc-400 hover:border-zinc-500 hover:text-white"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={next}
            className={clsx(
              'ui-transition rounded-lg px-5 py-1.5 text-xs font-medium text-white',
              'bg-accent-orange hover:bg-orange-600'
            )}
          >
            {currentStep === totalSteps - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
