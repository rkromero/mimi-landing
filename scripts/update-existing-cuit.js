const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function updateExistingRecords() {
  try {
    console.log('🔄 Iniciando actualización de registros existentes...')
    
    // Obtener todos los registros sin CUIT
    const recordsWithoutCuit = await prisma.contactForm.findMany({
      where: {
        cuit: null
      }
    })
    
    console.log(`📊 Encontrados ${recordsWithoutCuit.length} registros sin CUIT`)
    
    // Actualizar cada registro con un CUIT temporal
    let updatedCount = 0
    
    for (const record of recordsWithoutCuit) {
      // Generar CUIT temporal basado en el ID (para mantener consistencia)
      const tempCuit = `20-${record.id.slice(-8).padStart(8, '0')}-9`
      
      await prisma.contactForm.update({
        where: { id: record.id },
        data: { cuit: tempCuit }
      })
      
      updatedCount++
      
      if (updatedCount % 50 === 0) {
        console.log(`✅ Actualizados ${updatedCount} registros...`)
      }
    }
    
    console.log(`🎉 Migración completada! ${updatedCount} registros actualizados con CUIT temporal`)
    console.log('📝 Nota: Los CUITs temporales son solo para migración y deben ser reemplazados por CUITs reales')
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateExistingRecords()
