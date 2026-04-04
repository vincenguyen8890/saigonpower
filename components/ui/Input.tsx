'use client'

import { cn } from '@/lib/utils'
import { forwardRef, type InputHTMLAttributes } from 'react'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string
  error?: string
  hint?: string
  prefix?: React.ReactNode
  suffix?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, prefix, suffix, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
            {props.required && <span className="text-brand-red ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {prefix && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              {prefix}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'block w-full rounded-xl border transition-all duration-150',
              'bg-white text-gray-900 placeholder-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent',
              'disabled:bg-surface-muted disabled:cursor-not-allowed',
              error
                ? 'border-brand-red focus:ring-brand-red'
                : 'border-surface-border hover:border-gray-400',
              prefix ? 'pl-10' : 'pl-4',
              suffix ? 'pr-10' : 'pr-4',
              'py-3 text-sm',
              className
            )}
            {...props}
          />
          {suffix && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
              {suffix}
            </div>
          )}
        </div>
        {error && <p className="mt-1.5 text-xs text-brand-red">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-xs text-gray-500">{hint}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
