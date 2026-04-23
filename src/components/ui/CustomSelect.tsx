import clsx from 'clsx'
import { Check, ChevronDown } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

interface SelectOption {
  value: string
  label: string
  description?: string
}

interface CustomSelectProps {
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  placeholder?: string
  ariaLabel: string
  dataCy?: string
  disabled?: boolean
}

export function CustomSelect({
  value,
  options,
  onChange,
  placeholder = 'Select',
  ariaLabel,
  dataCy,
  disabled = false,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const selected = useMemo(() => options.find((option) => option.value === value), [options, value])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!rootRef.current) {
        return
      }

      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={rootRef} className={clsx('relative', open ? 'z-[90]' : 'z-0')}>
      <button
        data-cy={dataCy}
        type="button"
        role="combobox"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={clsx(
          'ui-transition flex w-full items-center justify-between rounded-lg border border-canvas-border bg-[#0b1020] px-3 py-2 text-sm',
          'text-white focus:outline-none focus:ring-2 focus:ring-accent-primary',
          disabled && 'cursor-not-allowed opacity-60'
        )}
      >
        <span className={clsx('truncate', !selected && 'text-gray-500')}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={16} className={clsx('ui-transition text-gray-300', open && 'rotate-180')} />
      </button>

      {open && !disabled && (
        <div
          role="listbox"
          className="absolute z-[100] mt-2 w-full overflow-hidden rounded-lg border border-[#3a4158] bg-[#0b1020] shadow-[0_20px_40px_rgba(0,0,0,0.45)]"
        >
          <div className="max-h-56 overflow-y-auto p-1">
            {options.map((option) => {
              const isSelected = option.value === value

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value)
                    setOpen(false)
                  }}
                  className={clsx(
                    'ui-transition flex w-full items-start justify-between gap-3 rounded-md px-3 py-2 text-left text-sm',
                    isSelected
                      ? 'bg-accent-primary/20 text-accent-secondary'
                      : 'text-gray-200 hover:bg-canvas-bg hover:text-white'
                  )}
                >
                  <span>
                    <span className="block">{option.label}</span>
                    {option.description && <span className="block text-xs text-gray-500">{option.description}</span>}
                  </span>
                  {isSelected && <Check size={14} className="mt-0.5 shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
