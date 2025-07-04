import React from 'react'

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
  className?: string
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  type = 'button',
  className = ''
}) => {
  const baseClasses = 'font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 button-press relative overflow-hidden'
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 focus:ring-primary-500 shadow-lg hover:shadow-xl',
    secondary: 'bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-400 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 focus:ring-red-500 shadow-lg hover:shadow-xl'
  }
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3.5 text-lg'
  }
  
  const disabledClasses = 'opacity-50 cursor-not-allowed hover:shadow-lg'
  
  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${(disabled || loading) ? disabledClasses : ''}
    ${className}
  `.trim()

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {/* Shimmer effect for primary and danger buttons */}
      {(variant === 'primary' || variant === 'danger') && !disabled && !loading && (
        <div className="absolute inset-0 -top-[2px] -bottom-[2px] opacity-0 hover:opacity-100 transition-opacity duration-300">
          <div className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer" />
        </div>
      )}
      
      <span className="relative z-10 flex items-center justify-center">
        {loading ? (
          <>
            <div className={`w-4 h-4 border-2 ${variant === 'secondary' ? 'border-gray-600' : 'border-white'} border-t-transparent rounded-full animate-spin mr-2`} />
            {children}
          </>
        ) : (
          children
        )}
      </span>
    </button>
  )
}