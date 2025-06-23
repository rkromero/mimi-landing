import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('🔄 Actualizando estructura de base de datos...')
    
    // Intentar agregar las nuevas columnas
    await prisma.$executeRaw`
      ALTER TABLE contact_forms 
      ADD COLUMN IF NOT EXISTS "etapaCrm" TEXT DEFAULT 'entrante',
      ADD COLUMN IF NOT EXISTS "notas" TEXT,
      ADD COLUMN IF NOT EXISTS "valor" DECIMAL(10,2)
    `
    
    console.log('✅ Estructura de base de datos actualizada')
    
    return NextResponse.json({
      success: true,
      message: 'Base de datos actualizada correctamente'
    })
  } catch (error) {
    console.error('❌ Error al actualizar base de datos:', error)
    return NextResponse.json(
      { 
        error: 'Error al actualizar base de datos',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 