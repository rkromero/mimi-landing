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
            console.log('🎯 Google Ads cargado con ID:', '${GOOGLE_ADS_ID}');
            console.log('🎯 Variables disponibles:', {
              GOOGLE_ADS_ID: '${GOOGLE_ADS_ID}',
              CONVERSION_LABEL: '${process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL || 'DEFAULT_LABEL'}'
            });
          `}
        </Script>
      </head>
      <body suppressHydrationWarning={true}>{children}</body>
    </html>
  )
}
