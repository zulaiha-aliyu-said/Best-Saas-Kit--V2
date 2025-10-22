"use client"

import { ReactNode, Suspense } from "react"
import { LoadingSpinner } from "./loading-spinner"

interface LazyComponentProps {
  children: ReactNode
  fallback?: ReactNode
  className?: string
}

export function LazyComponent({ 
  children, 
  fallback = <LoadingSpinner size="md" />,
  className
}: LazyComponentProps) {
  return (
    <Suspense fallback={
      <div className={className}>
        {fallback}
      </div>
    }>
      {children}
    </Suspense>
  )
}




