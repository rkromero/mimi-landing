'use client'

import { useEffect } from 'react'

// Declaración de tipos para gtag
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

export const useGoogleAds = () => {
  useEffect(() => {
    // Verificar que gtag esté disponible
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      console.log('Google Ads cargado correctamente')
    }
  }, [])

  const trackLeadSubmission = (formData: any) => {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      // Tracking básico de conversión
      window.gtag('event', 'conversion', {
        send_to: 'AW-16869254273/MTk0CLP7o-EaEIHJ8es-'
      })
    }
  }

  const trackInteraction = (action: string) => {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', action)
    }
  }

  const isGtagAvailable = typeof window !== 'undefined' && typeof window.gtag === 'function'

  return {
    trackLeadSubmission,
    trackInteraction,
    isGtagAvailable
  }
} 