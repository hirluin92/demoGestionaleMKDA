import { HTMLAttributes } from 'react'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'gold' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md'
  glow?: boolean
}

export function Badge({ 
  children, 
  variant = 'gold', 
  size = 'md',
  glow = false,
  className = '',
  ...props 
}: BadgeProps) {
  const variants = {
    // Usando gold-400 invece di gold-500 per WCAG compliance
    gold: 'bg-gradient-to-r from-gold-400 to-gold-500 text-dark-950 shadow-gold font-bold',
    success: 'bg-accent-success/20 text-accent-success border border-accent-success/30 font-semibold',
    warning: 'bg-gold-400/20 text-gold-300 border border-gold-400/30 font-semibold',
    danger: 'bg-accent-danger/20 text-accent-danger border border-accent-danger/30 font-semibold',
    info: 'bg-accent-info/20 text-accent-info border border-accent-info/30 font-semibold',
  }
  
  const sizes = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  }
  
  const glowClass = glow ? 'animate-glow will-change-shadow' : ''
  
  return (
    <span 
      className={`inline-flex items-center rounded-full ${variants[variant]} ${sizes[size]} ${glowClass} ${className}`}
      role="status"
      {...props}
    >
      {children}
    </span>
  )
}
