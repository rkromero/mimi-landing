const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function updateExistingRecords() {
  try {
    console.log('🔄 Actualizando registros existentes...')
    
    // Actualizar registros existentes con valores por defecto
    const result = await prisma.contactForm.updateMany({
      where: {
        OR: [
          { provincia: null },
          { localidad: null },
          { cantidad: null }
        ]
      },
      data: {
        provincia: 'Buenos Aires', // Valor por defecto
        localidad: 'No especificada', // Valor por defecto
        cantidad: '24-100' // Valor por defecto (entre 24 y 100 docenas)
      }
    })
    
    console.log(`✅ Actualizados ${result.count} registros`)
    
    // Verificar que todos los registros tengan valores
    const recordsWithNulls = await prisma.contactForm.findMany({
      where: {
        OR: [
          { provincia: null },
          { localidad: null },
          { cantidad: null }
        ]
      }
    })
    
    if (recordsWithNulls.length === 0) {
      console.log('✅ Todos los registros tienen valores válidos')
    } else {
      console.log(`⚠️  Aún hay ${recordsWithNulls.length} registros con valores nulos`)
    }
    
  } catch (error) {
    console.error('❌ Error actualizando registros:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateExistingRecords() 