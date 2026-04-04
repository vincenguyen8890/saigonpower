import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'blue' | 'gold' | 'green' | 'red' | 'gray'
  size?: 'sm' | 'md'
  className?: string
}

export default function Badge({ children, variant = 'blue', size = 'sm', className }: BadgeProps) {
  const variants = {
    blue: 'bg-blue-100 text-blue-800',
    gold: 'bg-amber-100 text-amber-800',
    green: 'bg-emerald-100 text-emerald-800',
    red: 'bg-red-100 text-red-800',
    gray: 'bg-gray-100 text-gray-700',
  }
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  }

  return (
    <span className={cn('inline-flex items-center font-medium rounded-full', variants[variant], sizes[size], className)}>
      {children}
    </span>
  )
}
