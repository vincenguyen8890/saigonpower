'use client'

import { cn } from '@/lib/utils'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'blue' | 'gold' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  fullWidth?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, fullWidth, children, disabled, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 ' +
      'focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      // Primary CTA — always green
      primary:
        'bg-brand-green hover:bg-brand-greenDark text-white shadow-green hover:shadow-green-lg ' +
        'hover:-translate-y-0.5 focus:ring-brand-green',
      // Secondary — white outlined
      secondary:
        'bg-white hover:bg-surface-bg text-brand-dark border border-surface-border shadow-sm ' +
        'hover:border-brand-green hover:text-brand-green focus:ring-brand-green',
      // Ghost — minimal
      ghost:
        'text-brand-muted hover:text-brand-green hover:bg-brand-greenLight focus:ring-brand-green',
      // Outline — green border
      outline:
        'border-2 border-brand-green text-brand-green hover:bg-brand-green hover:text-white ' +
        'focus:ring-brand-green hover:-translate-y-0.5',
      // Blue — tech/energy accent
      blue:
        'bg-brand-blue hover:bg-brand-blueDark text-white shadow-blue hover:-translate-y-0.5 ' +
        'focus:ring-brand-blue',
      // Gold — maps to green CTA in new design system
      gold:
        'bg-brand-green hover:bg-brand-greenDark text-white shadow-green hover:shadow-green-lg ' +
        'hover:-translate-y-0.5 focus:ring-brand-green',
      // Danger
      danger:
        'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500',
    }

    const sizes = {
      sm: 'px-4 py-2 text-sm gap-1.5',
      md: 'px-5 py-2.5 text-sm gap-2',
      lg: 'px-7 py-3.5 text-base gap-2',
      xl: 'px-9 py-4 text-lg gap-2.5',
    }

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
