#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🚀 MIMI Landing - Optimizador de Conversiones')
console.log('=' .repeat(50))

// Función para verificar archivos
const checkFileExists = (filePath) => {
  return fs.existsSync(filePath)
}

// Función para verificar variables de entorno
const checkEnvVariables = () => {
  console.log('\n📋 Verificando variables de entorno...')
  
  const requiredEnvs = [
    'DATABASE_URL',
    'RESEND_API_KEY',
    'EMAIL_TO',
    'NEXT_PUBLIC_GOOGLE_ADS_ID'
  ]
  
  const optionalEnvs = [
    'NEXT_PUBLIC_GA_MEASUREMENT_ID',
    'NEXT_PUBLIC_META_PIXEL_ID',
    'NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION',
    'NEXT_PUBLIC_HOTJAR_ID'
  ]
  
  let envPath = '.env'
  if (!checkFileExists(envPath)) {
    envPath = '.env.local'
  }
  
  if (!checkFileExists(envPath)) {
    console.log('❌ No se encontró archivo .env')
    console.log('💡 Ejecuta: cp env.example .env')
    return false
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8')
  
  console.log('\n✅ Variables requeridas:')
  requiredEnvs.forEach(envVar => {
    const hasVar = envContent.includes(envVar)
    const hasValue = envContent.includes(`${envVar}=`) && !envContent.includes(`${envVar}=""`)
    console.log(`  ${hasValue ? '✅' : '❌'} ${envVar}`)
  })
  
  console.log('\n🔧 Variables opcionales (para maximizar conversiones):')
  optionalEnvs.forEach(envVar => {
    const hasVar = envContent.includes(envVar)
    const hasValue = envContent.includes(`${envVar}=`) && !envContent.includes(`${envVar}=""`)
    console.log(`  ${hasValue ? '✅' : '⚠️'} ${envVar}`)
  })
  
  return true
}

// Función para verificar archivos críticos
const checkCriticalFiles = () => {
  console.log('\n📁 Verificando archivos críticos...')
  
  const criticalFiles = [
    'app/layout.tsx',
    'app/page.tsx',
    'hooks/use-google-ads.ts',
    'lib/conversion-config.ts',
    'public/manifest.json',
    'public/robots.txt',
    'public/sitemap.xml'
  ]
  
  criticalFiles.forEach(file => {
    const exists = checkFileExists(file)
    console.log(`  ${exists ? '✅' : '❌'} ${file}`)
  })
}

// Función para verificar base de datos
const checkDatabase = () => {
  console.log('\n🗄️ Verificando base de datos...')
  
  try {
    execSync('npx prisma db pull', { stdio: 'ignore' })
    console.log('  ✅ Conexión a base de datos exitosa')
    
    execSync('npx prisma generate', { stdio: 'ignore' })
    console.log('  ✅ Cliente Prisma generado')
    
    return true
  } catch (error) {
    console.log('  ❌ Error de conexión a base de datos')
    console.log('  💡 Verifica DATABASE_URL en .env')
    return false
  }
}

// Función para verificar build
const checkBuild = () => {
  console.log('\n🏗️ Verificando build...')
  
  try {
    execSync('npm run build', { stdio: 'ignore' })
    console.log('  ✅ Build exitoso')
    return true
  } catch (error) {
    console.log('  ❌ Error en build')
    console.log('  💡 Ejecuta: npm run build para ver errores')
    return false
  }
}

// Función para mostrar recomendaciones
const showRecommendations = () => {
  console.log('\n🎯 RECOMENDACIONES PARA MAXIMIZAR CONVERSIONES:')
  console.log('=' .repeat(50))
  
  console.log('\n1. 📊 ANALYTICS COMPLETO:')
  console.log('   • Google Analytics 4: Configura NEXT_PUBLIC_GA_MEASUREMENT_ID')
  console.log('   • Meta Pixel: Configura NEXT_PUBLIC_META_PIXEL_ID')
  console.log('   • Hotjar: Configura NEXT_PUBLIC_HOTJAR_ID (análisis de comportamiento)')
  
  console.log('\n2. 🔍 SEO AVANZADO:')
  console.log('   • Google Search Console: Configura NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION')
  console.log('   • Verifica que sitemap.xml esté actualizado')
  console.log('   • Revisa meta tags en app/layout.tsx')
  
  console.log('\n3. 📱 OPTIMIZACIÓN MOBILE:')
  console.log('   • Prueba PWA: Instala la app desde Chrome móvil')
  console.log('   • Verifica Core Web Vitals en PageSpeed Insights')
  console.log('   • Testa formulario en dispositivos móviles')
  
  console.log('\n4. 🚀 PERFORMANCE:')
  console.log('   • Lighthouse: Ejecuta audit de performance')
  console.log('   • Optimiza imágenes: Usa WebP cuando sea posible')
  console.log('   • Verifica lazy loading de imágenes')
  
  console.log('\n5. 📈 CONVERSION RATE OPTIMIZATION:')
  console.log('   • A/B Testing: Habilita NEXT_PUBLIC_ENABLE_AB_TESTING')
  console.log('   • Heatmaps: Habilita NEXT_PUBLIC_ENABLE_HEATMAPS')
  console.log('   • Prueba diferentes CTAs en el formulario')
  
  console.log('\n6. 🔐 SEGURIDAD:')
  console.log('   • SSL: Verifica certificado en dominio personalizado')
  console.log('   • Headers de seguridad: Configurados en next.config.mjs')
  console.log('   • CSP: Considera Content Security Policy')
  
  console.log('\n7. 📞 CONTACTO OPTIMIZADO:')
  console.log('   • WhatsApp: Configura NEXT_PUBLIC_WHATSAPP_NUMBER')
  console.log('   • Email: Configura EMAIL_TO con múltiples destinatarios')
  console.log('   • Teléfono: Configura NEXT_PUBLIC_BUSINESS_PHONE')
}

// Función principal
const main = () => {
  let allGood = true
  
  // Verificaciones
  allGood = checkEnvVariables() && allGood
  checkCriticalFiles()
  allGood = checkDatabase() && allGood
  allGood = checkBuild() && allGood
  
  // Mostrar estado final
  console.log('\n' + '=' .repeat(50))
  if (allGood) {
    console.log('🎉 ¡LANDING LISTA PARA MÁXIMA CONVERSIÓN!')
    console.log('✅ Todas las verificaciones pasaron correctamente')
  } else {
    console.log('⚠️  Hay algunos problemas que resolver')
    console.log('🔧 Revisa los errores arriba y corrígelos')
  }
  
  // Mostrar recomendaciones
  showRecommendations()
  
  console.log('\n🚀 PRÓXIMOS PASOS:')
  console.log('1. Deploy a Railway con el dominio personalizado')
  console.log('2. Configura Google Analytics y Meta Pixel')
  console.log('3. Verifica Google Search Console')
  console.log('4. Haz pruebas de conversión con usuarios reales')
  console.log('5. Monitorea métricas en el panel CRM')
  
  console.log('\n📧 ¿Necesitas ayuda? Contacta al equipo de desarrollo')
}

// Ejecutar
main() 