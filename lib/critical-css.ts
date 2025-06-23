// Utilidades para CSS crítico y optimización de performance

// CSS crítico inline para above-the-fold content
export const criticalCSS = `
  /* Reset y base crítico */
  *,::before,::after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}
  html{line-height:1.5;-webkit-text-size-adjust:100%;tab-size:4;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif}
  body{margin:0;line-height:inherit}
  
  /* Header crítico */
  .header-critical{
    background-color:#fef7f0;
    padding:0.5rem 0;
    position:fixed;
    top:0;
    left:0;
    right:0;
    z-index:50;
    backdrop-filter:blur(8px);
  }
  
  /* Logo crítico */
  .logo-critical{
    height:1.25rem;
    width:auto;
    filter:hue-rotate(10deg) saturate(1.1);
  }
  
  /* Hero section crítico */
  .hero-critical{
    padding-top:6rem;
    min-height:100vh;
    background:linear-gradient(135deg, #fef7f0 0%, #ffffff 100%);
  }
  
  /* Botón crítico */
  .btn-critical{
    background-color:#E65C37;
    color:white;
    padding:0.75rem 2rem;
    border-radius:0.5rem;
    font-weight:600;
    transition:all 0.2s;
    border:none;
    cursor:pointer;
  }
  .btn-critical:hover{
    background-color:#d54d2a;
    transform:translateY(-1px);
  }
  
  /* Animaciones críticas */
  @keyframes fadeInUp{
    from{opacity:0;transform:translateY(30px)}
    to{opacity:1;transform:translateY(0)}
  }
  .animate-fadeInUp{animation:fadeInUp 0.6s ease-out}
`

// Función para preload de recursos críticos
export const preloadCriticalResources = () => {
  if (typeof window === 'undefined') return

  // Preload de imágenes críticas
  const criticalImages = [
    '/images/mimi-logo-new.png',
    '/images/alfajor-chocolate-blanco.jpg',
    '/images/alfajor-chocolate-negro.jpg'
  ]

  criticalImages.forEach(src => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = src
    document.head.appendChild(link)
  })

  // Preconnect a dominios externos
  const externalDomains = [
    'https://www.googletagmanager.com',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
  ]

  externalDomains.forEach(domain => {
    const link = document.createElement('link')
    link.rel = 'preconnect'
    link.href = domain
    document.head.appendChild(link)
  })
}

// Función para lazy load de recursos no críticos
export const lazyLoadNonCritical = () => {
  if (typeof window === 'undefined') return

  // Lazy load de CSS no crítico
  const loadCSS = (href: string) => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    link.media = 'print'
    link.onload = () => {
      link.media = 'all'
    }
    document.head.appendChild(link)
  }

  // Cargar fuentes de forma asíncrona
  setTimeout(() => {
    loadCSS('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap')
  }, 100)
}

// Hook para optimización de performance
export const usePerformanceOptimization = () => {
  if (typeof window === 'undefined') return

  // Preload recursos críticos al cargar
  window.addEventListener('load', () => {
    preloadCriticalResources()
    lazyLoadNonCritical()
    
    // Reportar métricas de performance
    if ('performance' in window) {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        const paint = performance.getEntriesByType('paint')
        
        console.log('📊 Performance Metrics:', {
          'DOM Content Loaded': `${navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart}ms`,
          'Load Complete': `${navigation.loadEventEnd - navigation.loadEventStart}ms`,
          'First Paint': paint.find(p => p.name === 'first-paint')?.startTime + 'ms',
          'First Contentful Paint': paint.find(p => p.name === 'first-contentful-paint')?.startTime + 'ms'
        })
      }, 1000)
    }
  })
}

// Función para comprimir y optimizar imágenes en el cliente
export const optimizeImage = (src: string, quality: number = 85): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      
      canvas.width = img.width
      canvas.height = img.height
      
      ctx.drawImage(img, 0, 0)
      
      // Convertir a WebP si es soportado
      const format = 'image/webp'
      const optimizedSrc = canvas.toDataURL(format, quality / 100)
      
      resolve(optimizedSrc)
    }
    img.src = src
  })
} 