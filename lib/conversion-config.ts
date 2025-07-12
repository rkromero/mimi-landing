// Configuración para optimización de conversiones
export const conversionConfig = {
  // Configuración de A/B Testing
  abTesting: {
    enabled: process.env.NEXT_PUBLIC_ENABLE_AB_TESTING === 'true',
    tests: {
      heroButton: {
        variants: ['Quiero ser distribuidor', 'Únete ahora', 'Comenzar'],
        defaultVariant: 'Quiero ser distribuidor'
      },
      formTitle: {
        variants: ['Contactanos', 'Solicita información', 'Únete a MIMI'],
        defaultVariant: 'Contactanos'
      }
    }
  },

  // Configuración de tracking
  tracking: {
    googleAds: {
      enabled: !!process.env.NEXT_PUBLIC_GOOGLE_ADS_ID,
      id: process.env.NEXT_PUBLIC_GOOGLE_ADS_ID,
      conversionLabel: process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL
    },
    googleAnalytics: {
      enabled: !!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
      id: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
    },
    metaPixel: {
      enabled: !!process.env.NEXT_PUBLIC_META_PIXEL_ID,
      id: process.env.NEXT_PUBLIC_META_PIXEL_ID
    },
    hotjar: {
      enabled: !!process.env.NEXT_PUBLIC_HOTJAR_ID,
      id: process.env.NEXT_PUBLIC_HOTJAR_ID
    }
  },

  // Configuración de WhatsApp
  whatsapp: {
    number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5491173639684',
    defaultMessage: process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE || 'Hola! Me interesa ser distribuidor de alfajores MIMI. ¿Podemos hablar?'
  },

  // Configuración de negocio
  business: {
    email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || 'ventas@mimialfajor.com.ar',
    phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE || '+54 11 7363-9684',
    address: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || 'Buenos Aires, Argentina'
  },

  // Configuración de conversión
  conversion: {
    leadValueEstimation: {
      baseValue: 50000, // ARS
      multipliers: {
        quantity: {
          'menos-24': 0.6,
          '24-100': 1.0,
          'mas-100': 1.8
        },
        stage: {
          'buscando-opciones': 0.3,
          'empezar-pronto': 0.6,
          'listo-primer-pedido': 1.2,
          'busco-mejor-proveedor': 1.5
        }
      }
    },
    formOptimization: {
      enableProgressBar: true,
      enableRealTimeValidation: true,
      enableSmartDefaults: true,
      enableFieldHighlight: true
    }
  },

  // Configuración de performance
  performance: {
    enableServiceWorker: true,
    enableImageOptimization: true,
    enableCriticalCSS: true,
    enablePreloading: true,
    enableCompression: true
  },

  // Configuración de UX
  ux: {
    enableScrollAnimations: true,
    enableSmoothScrolling: true,
    enableLazyLoading: true,
    enableProgressIndicators: true,
    enableStickyHeader: true
  },

  // Configuración de seguridad
  security: {
    enableCSP: true,
    enableSRI: true,
    enableHSTS: true,
    enableXSSProtection: true
  },

  // URLs importantes
  urls: {
    base: process.env.NEXT_PUBLIC_BASE_URL || 'https://www.mimialfajor.com.ar',
    admin: '/admin',
    crm: '/crm',
    api: {
      contact: '/api/contact',
      crm: '/api/crm'
    }
  }
}

// Función para obtener configuración específica
export const getConversionConfig = (section: keyof typeof conversionConfig) => {
  return conversionConfig[section]
}

// Función para verificar si una feature está habilitada
export const isFeatureEnabled = (feature: string): boolean => {
  const envVar = `NEXT_PUBLIC_ENABLE_${feature.toUpperCase()}`
  return process.env[envVar] === 'true'
}

// Función para generar URL de WhatsApp
export const getWhatsAppUrl = (customMessage?: string): string => {
  const { number, defaultMessage } = conversionConfig.whatsapp
  const message = customMessage || defaultMessage
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}

// Función para generar URL de email
export const getEmailUrl = (subject?: string, body?: string): string => {
  const { email } = conversionConfig.business
  const subjectParam = subject ? `subject=${encodeURIComponent(subject)}` : ''
  const bodyParam = body ? `body=${encodeURIComponent(body)}` : ''
  const params = [subjectParam, bodyParam].filter(Boolean).join('&')
  return `mailto:${email}${params ? `?${params}` : ''}`
}

// Función para generar URL de teléfono
export const getPhoneUrl = (): string => {
  const { phone } = conversionConfig.business
  return `tel:${phone}`
}

export default conversionConfig 