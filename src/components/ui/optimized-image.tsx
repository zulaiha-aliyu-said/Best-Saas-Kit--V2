"use client"

import Image, { ImageProps } from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Skeleton } from "./skeleton"

interface OptimizedImageProps extends Omit<ImageProps, "onLoad"> {
  fallback?: string
  containerClassName?: string
}

export function OptimizedImage({
  src,
  alt,
  className,
  containerClassName,
  fallback = "/placeholder.svg",
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  return (
    <div className={cn("relative overflow-hidden", containerClassName)}>
      {isLoading && (
        <Skeleton className={cn("absolute inset-0", className)} />
      )}
      <Image
        src={error ? fallback : src}
        alt={alt}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setError(true)
          setIsLoading(false)
        }}
        loading="lazy"
        {...props}
      />
    </div>
  )
}
