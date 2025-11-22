import { HTMLAttributes, forwardRef } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', hover = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-white rounded-xl shadow-lg border border-charcoal-100 ${hover ? 'hover:shadow-xl transition-all duration-300 hover:-translate-y-1' : ''} ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export default Card