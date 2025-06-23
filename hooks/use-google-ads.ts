'use client'

import { useEffect } from 'react'

// Declara gtag en el scope global para TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
    gtag_report_conversion: (url?: string) => boolean
  }
}

export const useGoogleAds = () => {
  useEffect(() => {
    // Verificar que gtag esté disponible
    if (typeof window !== 'undefined' && window.gtag) {
      console.log('Google Ads cargado correctamente')
    }
  }, [])

  const trackLeadSubmission = (formData: any) => {
    if (typeof window !== 'undefined' && window.gtag) {
      // Tracking básico de conversión
      window.gtag('event', 'conversion', {
        send_to: 'AW-16869254273/MTk0CLP7o-EaEIHJ8es-'
      })
    }
  }

  const trackInteraction = (action: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', action)
    }
  }

  return {
    trackLeadSubmission,
    trackInteraction,
    isGtagAvailable: typeof window !== 'undefined' && !!window.gtag
  }
} 