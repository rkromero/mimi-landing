/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración mínima
  serverExternalPackages: ['@prisma/client', 'prisma'],
  
  // Optimizaciones para dominio personalizado
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

export default nextConfig
