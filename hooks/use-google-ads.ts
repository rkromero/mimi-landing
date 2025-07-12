'use client'

import { useEffect } from 'react'

// Declaración de tipos para gtag y fbq
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    fbq: (...args: any[]) => void
    dataLayer: any[]
  }
}

export const useGoogleAds = () => {
  useEffect(() => {
    // Verificar que gtag esté disponible
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      console.log('Google Ads/Analytics cargado correctamente')
    }
    
    // Verificar que fbq esté disponible
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      console.log('Meta Pixel cargado correctamente')
    }
  }, [])

  const trackLeadSubmission = (formData: any) => {
    const leadValue = estimateLeadValue(formData)
    
    // Google Ads Conversion
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', {
        send_to: 'AW-16869254273/MTk0CLP7o-EaEIHJ8es-',
        value: leadValue,
        currency: 'ARS'
      })
    }
    
    // Google Analytics Event
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'generate_lead', {
        event_category: 'Lead Generation',
        event_label: `${formData.negocio} - ${formData.ubicacion}`,
        value: leadValue,
        currency: 'ARS',
        custom_parameters: {
          lead_type: 'distribuidor',
          business_type: formData.negocio,
          location: formData.ubicacion,
          quantity: formData.cantidad,
          stage: formData.etapa,
          estimated_value: leadValue
        }
      })
    }
    
    // Meta Pixel Event
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'Lead', {
        content_name: 'Distribuidor MIMI',
        content_category: 'Lead Generation',
        value: leadValue,
        currency: 'ARS',
        custom_data: {
          business_name: formData.negocio,
          location: formData.ubicacion,
          quantity: formData.cantidad,
          stage: formData.etapa
        }
      })
    }
    
    console.log('🎯 Lead tracking enviado:', {
      negocio: formData.negocio,
      ubicacion: formData.ubicacion,
      valor_estimado: leadValue
    })
  }

  const trackFormInteraction = (field: string, action: string = 'focus') => {
    // Google Analytics Event
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'form_interaction', {
        event_category: 'Form Engagement',
        event_label: `${field}_${action}`,
        custom_parameters: {
          form_field: field,
          interaction_type: action
        }
      })
    }
    
    // Meta Pixel Event
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'InitiateCheckout', {
        content_name: 'Formulario Distribuidor',
        content_category: 'Form Interaction'
      })
    }
  }

  const trackSectionView = (section: string) => {
    // Google Analytics Event
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'scroll', {
        event_category: 'Page Engagement',
        event_label: section,
        custom_parameters: {
          section_viewed: section
        }
      })
    }
  }

  const trackButtonClick = (buttonName: string, location: string) => {
    // Google Analytics Event
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'click', {
        event_category: 'Button Click',
        event_label: `${buttonName}_${location}`,
        custom_parameters: {
          button_name: buttonName,
          button_location: location
        }
      })
    }
    
    // Meta Pixel Event
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'ViewContent', {
        content_name: buttonName,
        content_category: 'Button Click'
      })
    }
  }

  const trackWhatsAppClick = (phoneNumber: string) => {
    // Google Analytics Event
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'contact', {
        event_category: 'Contact',
        event_label: 'WhatsApp',
        method: 'whatsapp'
      })
    }
    
    // Meta Pixel Event
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'Contact', {
        content_name: 'WhatsApp Contact',
        content_category: 'Contact Method'
      })
    }
  }

  const trackPhoneClick = (phoneNumber: string) => {
    // Google Analytics Event
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'contact', {
        event_category: 'Contact',
        event_label: 'Phone',
        method: 'phone'
      })
    }
    
    // Meta Pixel Event
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'Contact', {
        content_name: 'Phone Contact',
        content_category: 'Contact Method'
      })
    }
  }

  const trackEmailClick = (email: string) => {
    // Google Analytics Event
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'contact', {
        event_category: 'Contact',
        event_label: 'Email',
        method: 'email'
      })
    }
    
    // Meta Pixel Event
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'Contact', {
        content_name: 'Email Contact',
        content_category: 'Contact Method'
      })
    }
  }

  // Función para estimar el valor del lead
  const estimateLeadValue = (formData: any) => {
    let baseValue = 50000 // Valor base en ARS
    
    // Ajustar según la cantidad estimada
    switch (formData.cantidad) {
      case 'menos-24':
        baseValue = 30000
        break
      case '24-100':
        baseValue = 80000
        break
      case 'mas-100':
        baseValue = 150000
        break
    }
    
    // Ajustar según la etapa
    switch (formData.etapa) {
      case 'buscando-opciones':
        baseValue = baseValue * 0.3
        break
      case 'empezar-pronto':
        baseValue = baseValue * 0.6
        break
      case 'listo-primer-pedido':
        baseValue = baseValue * 1.2
        break
      case 'busco-mejor-proveedor':
        baseValue = baseValue * 1.5
        break
    }
    
    return Math.round(baseValue)
  }

  const isGtagAvailable = typeof window !== 'undefined' && typeof window.gtag === 'function'
  const isFbqAvailable = typeof window !== 'undefined' && typeof window.fbq === 'function'

  return {
    trackLeadSubmission,
    trackFormInteraction,
    trackSectionView,
    trackButtonClick,
    trackWhatsAppClick,
    trackPhoneClick,
    trackEmailClick,
    isGtagAvailable,
    isFbqAvailable
  }
} 