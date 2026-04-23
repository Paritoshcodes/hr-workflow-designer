import clsx from 'clsx'

interface ValidationBadgeProps {
  label: string
  tone: 'error' | 'warning' | 'success'
}

export function ValidationBadge({ label, tone }: ValidationBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium',
        tone === 'error' && 'border-red-500/50 bg-red-500/10 text-red-300',
        tone === 'warning' && 'border-amber-500/50 bg-amber-500/10 text-amber-300',
        tone === 'success' && 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
      )}
    >
      {label}
    </span>
  )
}
