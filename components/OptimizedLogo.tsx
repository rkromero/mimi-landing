'use client'

import Image from 'next/image'

interface OptimizedLogoProps {
  className?: string
  priority?: boolean
  width?: number
  height?: number
}

export default function OptimizedLogo({ 
  className = "h-5 w-auto filter hue-rotate-12 saturate-110", 
  priority = true,
  width = 70,
  height = 28
}: OptimizedLogoProps) {
  return (
    <Image
      src="/images/mimi-logo-new.png"
      alt="MIMI Alfajores - Distribuidores Premium Argentina"
      width={width}
      height={height}
      className={className}
      priority={priority}
      quality={90}
    />
  )
} 