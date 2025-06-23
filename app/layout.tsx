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
        
        {/* Google tag (gtag.js) - Implementación básica */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-ads-config" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GOOGLE_ADS_ID}');
          `}
        </Script>
        

      </head>
      <body suppressHydrationWarning={true}>{children}</body>
    </html>
  )
}
