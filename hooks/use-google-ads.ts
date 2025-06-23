import { useCallback } from 'react'

// Declara gtag en el scope global para TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
    gtag_report_conversion: (url?: string) => boolean
  }
}

export const useGoogleAds = () => {
  // Función para verificar si gtag está disponible
  const isGtagAvailable = useCallback(() => {
    if (typeof window === 'undefined') return false
    
    // Verificar si gtag existe y si dataLayer está inicializado
    const hasGtag = typeof window.gtag === 'function'
    const hasDataLayer = Array.isArray(window.dataLayer)
    
    if (!hasGtag || !hasDataLayer) {
      console.warn('🔍 Google Ads not ready:', { hasGtag, hasDataLayer })
      return false
    }
    
    return true
  }, [])

  // Función gtag_report_conversion como Google sugiere
  const gtagReportConversion = useCallback((url?: string) => {
    if (!isGtagAvailable()) {
      console.warn('❌ Cannot report conversion - Google Ads not available')
      return false
    }

    try {
      const callback = function () {
        if (typeof url !== 'undefined') {
          window.location.href = url
        }
      }

      const conversionLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL || 'MTk0CLP7o-EaEIHJ8es-'
      
      window.gtag('event', 'conversion', {
        'send_to': `AW-16869254273/${conversionLabel}`,
        'value': 1.0,
        'currency': 'ARS',
        'event_callback': callback
      })

      console.log('🎯 Google Ads Conversion reported:', {
        send_to: `AW-16869254273/${conversionLabel}`,
        value: 1.0,
        currency: 'ARS'
      })

      return false
    } catch (error) {
      console.error('❌ Error reporting conversion:', error)
      return false
    }
  }, [isGtagAvailable])

  // Función para trackear conversiones (método anterior)
  const trackConversion = useCallback((conversionLabel?: string, value?: number) => {
    if (!isGtagAvailable()) {
      console.warn('❌ Cannot track conversion - Google Ads not available')
      return
    }

    try {
      // Usar variables de entorno de Railway
      const conversionId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.replace('AW-', '') || '16869254273'
      const label = conversionLabel || process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL || 'MTk0CLP7o-EaEIHJ8es-'
      
      // Evento de conversión básico
      window.gtag('event', 'conversion', {
        send_to: `AW-${conversionId}/${label}`,
        value: value || 1,
        currency: 'ARS'
      })

      console.log('🎯 Google Ads Conversion tracked:', {
        conversion_id: `AW-${conversionId}`,
        conversion_label: label,
        value: value || 1,
        env_vars: {
          GOOGLE_ADS_ID: process.env.NEXT_PUBLIC_GOOGLE_ADS_ID,
          CONVERSION_LABEL: process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL
        }
      })
    } catch (error) {
      console.error('❌ Error tracking conversion:', error)
    }
  }, [isGtagAvailable])

  // Función para trackear eventos personalizados
  const trackEvent = useCallback((eventName: string, parameters?: Record<string, any>) => {
    if (!isGtagAvailable()) {
      console.warn('❌ Cannot track event - Google Ads not available')
      return
    }

    try {
      window.gtag('event', eventName, {
        event_category: 'engagement',
        event_label: 'mimi_landing',
        ...parameters
      })

      console.log('📊 Google Ads Event tracked:', eventName, parameters)
    } catch (error) {
      console.error('❌ Error tracking event:', error)
    }
  }, [isGtagAvailable])

  // Función específica para formulario de leads - MEJORADA
  const trackLeadSubmission = useCallback((formData: any) => {
    if (!isGtagAvailable()) {
      console.warn('❌ Cannot track lead submission - Google Ads not available')
      return
    }

    try {
      // 1. Usar la función oficial de Google
      gtagReportConversion()
      
      // 2. Trackear conversión adicional (método anterior)
      trackConversion(process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL, 1)
      
      // 3. Trackear evento personalizado con datos del lead
      trackEvent('generate_lead', {
        lead_type: 'distributor_inquiry',
        business_type: formData.negocio || 'unknown',
        location: formData.ubicacion || 'unknown',
        quantity_interest: formData.cantidad || 'unknown',
        stage: formData.etapa || 'unknown',
        value: 1,
        currency: 'ARS'
      })

      console.log('✅ Lead submission tracked successfully with multiple methods')
    } catch (error) {
      console.error('❌ Error tracking lead submission:', error)
    }
  }, [gtagReportConversion, trackConversion, trackEvent, isGtagAvailable])

  // Función para trackear interacciones importantes
  const trackInteraction = useCallback((action: string, section?: string) => {
    trackEvent('page_interaction', {
      action,
      section: section || 'unknown',
      page: 'landing'
    })
  }, [trackEvent])

  return {
    trackConversion,
    trackEvent,
    trackLeadSubmission,
    trackInteraction,
    isGtagAvailable,
    gtagReportConversion
  }
} 