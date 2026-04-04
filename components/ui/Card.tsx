import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export default function Card({ children, className, hover, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-2xl shadow-card border border-surface-border',
        hover && 'transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}
