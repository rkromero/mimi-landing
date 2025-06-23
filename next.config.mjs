/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración mínima y segura
  // images: {
  //   unoptimized: true,
  // },
  
  // Configuración de servidor externo para Prisma
  serverExternalPackages: ['@prisma/client', 'prisma'],
  
  // Headers mínimos necesarios
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ]
  },
}

export default nextConfig
