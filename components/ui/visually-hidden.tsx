import * as React from "react"

interface VisuallyHiddenProps {
  children: React.ReactNode
  className?: string
}

export function VisuallyHidden({ children, className }: VisuallyHiddenProps) {
  return (
    <span
      className={`sr-only ${className || ""}`}
      aria-hidden="true"
    >
      {children}
    </span>
  )
}
