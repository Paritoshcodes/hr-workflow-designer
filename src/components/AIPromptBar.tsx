import clsx from 'clsx'
import { Loader2, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useAIGenerate } from '@/hooks/useAIGenerate'
import { useWorkflowStore } from '@/store/workflowStore'

const PLACEHOLDER_PROMPTS = [
  'Build me an onboarding workflow for a remote engineer...',
  'Create a leave approval process with multi-level sign-off...',
  'Design a document verification workflow for background checks...',
]

export function AIPromptBar() {
  const [prompt, setPrompt] = useState('')
  const [placeholderIndex] = useState(() => Math.floor(Math.random() * PLACEHOLDER_PROMPTS.length))
  const isGenerating = useWorkflowStore((state) => state.isGenerating)
  const generateError = useWorkflowStore((state) => state.generateError)
  const { generateWorkflow } = useAIGenerate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() || isGenerating) return
    await generateWorkflow(prompt)
    setPrompt('')
  }

  return (
    <div className="absolute left-1/2 top-4 z-30 -translate-x-1/2">
      <form
        onSubmit={handleSubmit}
        className={clsx(
          'ui-transition flex items-center gap-2 rounded-full border border-canvas-border bg-canvas-surface/90 px-4 py-2 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-md',
          'min-w-[420px] max-w-[560px] focus-within:border-accent-orange/60 focus-within:shadow-[0_0_20px_rgba(249,115,22,0.15)]',
          isGenerating && 'border-accent-orange/40'
        )}
      >
        <Sparkles size={16} className={clsx("shrink-0 ui-transition", prompt ? "text-accent-orange" : "text-zinc-500")} />

        {isGenerating ? (
          <div className="flex flex-1 items-center gap-2 text-sm text-zinc-400">
            <Loader2 size={14} className="animate-spin text-accent-orange" />
            <span className="ui-blink-cursor">Generating workflow</span>
          </div>
        ) : (
          <input
            data-cy="ai-prompt-bar"
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={PLACEHOLDER_PROMPTS[placeholderIndex]}
            className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-600 focus:outline-none"
            aria-label="AI workflow prompt"
          />
        )}

        <button
          type="submit"
          disabled={isGenerating || !prompt.trim()}
          className={clsx(
            'ui-transition shrink-0 rounded-full px-3 py-1 text-xs font-medium',
            'bg-accent-orange text-white hover:bg-orange-600',
            'disabled:cursor-not-allowed disabled:opacity-40'
          )}
        >
          {isGenerating ? '...' : 'Generate'}
        </button>
      </form>

      {generateError && (
        <p className="mt-2 rounded-lg bg-red-500/10 px-4 py-1.5 text-center text-xs text-red-400">
          {generateError}
        </p>
      )}
    </div>
  )
}
