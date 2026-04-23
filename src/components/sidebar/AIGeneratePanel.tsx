import { Loader2, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useAIGenerate } from '@/hooks/useAIGenerate'
import { useWorkflowStore } from '@/store/workflowStore'

const EXAMPLE_PROMPTS = [
  'New employee onboarding for an engineer',
  'Leave approval process with manager and HR sign-off',
  'Document verification workflow for background check',
]

export function AIGeneratePanel() {
  const [prompt, setPrompt] = useState('')
  const isGenerating = useWorkflowStore((state) => state.isGenerating)
  const generateError = useWorkflowStore((state) => state.generateError)
  const { generateWorkflow } = useAIGenerate()

  return (
    <div className="ui-panel-enter">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles size={14} className="text-accent-secondary" />
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-300">AI Workflow Generator</p>
      </div>

      <textarea
        data-cy="ai-generate-input"
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        className="ui-transition min-h-24 w-full rounded-lg border border-canvas-border bg-canvas-bg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-accent-primary"
        placeholder="Describe the workflow you need"
        aria-label="AI workflow prompt"
      />

      <button
        data-cy="btn-ai-generate"
        type="button"
        onClick={() => generateWorkflow(prompt)}
        disabled={isGenerating || !prompt.trim()}
        className="ui-transition ui-lift mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent-primary px-3 py-2 text-sm font-medium text-white hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
        aria-label="Generate workflow with AI"
      >
        {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
        {isGenerating ? 'Generating...' : 'Generate Workflow'}
      </button>

      {generateError && <p className="mt-2 text-xs text-red-400">{generateError}</p>}

      <div className="mt-4 space-y-1">
        <p className="text-[11px] uppercase tracking-wide text-gray-500">Examples</p>
        {EXAMPLE_PROMPTS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setPrompt(item)}
            className="ui-transition block w-full rounded-md px-2 py-1 text-left text-xs text-gray-300 hover:bg-canvas-bg hover:text-white"
            aria-label={`Use example prompt ${item}`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  )
}
