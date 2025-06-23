'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'

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
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState(false)

  // Preload del logo crítico
  useEffect(() => {
    if (priority) {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = '/images/mimi-logo-new.png'
      document.head.appendChild(link)
    }
  }, [priority])

  const handleLoad = () => {
    setIsLoaded(true)
  }

  const handleError = () => {
    setError(true)
    console.warn('⚠️ Error cargando logo MIMI')
  }

  // Fallback si hay error
  if (error) {
    return (
      <div className={`${className} bg-[#E65C37] text-white px-3 py-1 rounded font-bold text-sm`}>
        MIMI
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Placeholder mientras carga */}
      {!isLoaded && (
        <div 
          className={`${className} bg-gray-200 animate-pulse rounded`}
          style={{ width, height }}
        />
      )}
      
      {/* Logo optimizado */}
      <Image
        src="/images/mimi-logo-new.png"
        alt="MIMI Alfajores - Distribuidores Premium Argentina"
        width={width}
        height={height}
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        priority={priority}
        quality={90}
        sizes="(max-width: 768px) 60px, 70px"
        onLoad={handleLoad}
        onError={handleError}
        // Optimizaciones adicionales
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        // Placeholder blur para mejor UX
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
      />
    </div>
  )
} 