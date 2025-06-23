import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: 'MIMI Alfajores - Distribuidores Premium Argentinos',
  description: 'Únete a la red de distribuidores de alfajores MIMI. Productos premium argentinos con packaging disruptivo. Márgenes atractivos y soporte completo.',
  keywords: 'alfajores, distribuidor, argentina, premium, packaging, dulces, confitería',
  openGraph: {
    title: 'MIMI Alfajores - Distribuidores Premium',
    description: 'Únete a la red de distribuidores de alfajores MIMI. Productos premium argentinos.',
    type: 'website',
  },
  generator: 'v0.dev',
  // Optimizaciones adicionales
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code', // Agregar cuando tengas el código
  },
}

// Google Ads ID desde variables de entorno
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || 'AW-16869254273'
const CONVERSION_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL || 'MTk0CLP7o-EaEIHJ8es-'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#E65C37" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MIMI Distribuidores" />
        <link rel="apple-touch-icon" href="/images/mimi-logo-new.png" />
        
        {/* Preload de recursos críticos */}
        <link rel="preload" href="/images/mimi-logo-new.png" as="image" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        
        {/* Google tag (gtag.js) - Usando variables de entorno */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
          strategy="beforeInteractive"
        />
        <Script id="google-ads-config" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GOOGLE_ADS_ID}');
            
            // Función gtag_report_conversion como Google sugiere
            function gtag_report_conversion(url) {
              var callback = function () {
                if (typeof(url) != 'undefined') {
                  window.location = url;
                }
              };
              gtag('event', 'conversion', {
                'send_to': '${GOOGLE_ADS_ID}/${CONVERSION_LABEL}',
                'value': 1.0,
                'currency': 'ARS',
                'event_callback': callback
              });
              return false;
            }
            
            // Hacer la función disponible globalmente
            window.gtag_report_conversion = gtag_report_conversion;
            
            console.log('🎯 Google Ads cargado con ID:', '${GOOGLE_ADS_ID}');
            console.log('🎯 Conversion Label:', '${CONVERSION_LABEL}');
            console.log('🎯 Variables disponibles:', {
              GOOGLE_ADS_ID: '${GOOGLE_ADS_ID}',
              CONVERSION_LABEL: '${CONVERSION_LABEL}',
              gtag_report_conversion: typeof gtag_report_conversion
            });
          `}
        </Script>
        
        {/* Service Worker Registration */}
        <Script id="service-worker-registration" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                  .then(function(registration) {
                    console.log('🔧 Service Worker registrado exitosamente:', registration.scope);
                    
                    // Escuchar actualizaciones
                    registration.addEventListener('updatefound', () => {
                      const newWorker = registration.installing;
                      newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                          console.log('🔄 Nueva versión disponible, actualizando...');
                          newWorker.postMessage({ type: 'SKIP_WAITING' });
                        }
                      });
                    });
                  })
                  .catch(function(error) {
                    console.log('❌ Error al registrar Service Worker:', error);
                  });
              });
            }
          `}
        </Script>
      </head>
      <body suppressHydrationWarning={true}>{children}</body>
    </html>
  )
}
