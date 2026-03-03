import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CrmRole } from '@prisma/client'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAuth(request, [CrmRole.ADMIN])
    if (error) return error

    if (process.env.ENABLE_DB_ADMIN_ENDPOINTS !== 'true') {
      return NextResponse.json(
        { error: 'Endpoint deshabilitado en este entorno' },
        { status: 403 }
      )
    }

    console.log('🔄 Actualizando estructura de base de datos...')
    
    // Intentar agregar las nuevas columnas
    await prisma.$executeRaw`ALTER TABLE contact_forms ADD COLUMN IF NOT EXISTS "etapaCrm" TEXT DEFAULT 'entrante'`
    await prisma.$executeRaw`ALTER TABLE contact_forms ADD COLUMN IF NOT EXISTS "notas" TEXT`
    await prisma.$executeRaw`ALTER TABLE contact_forms ADD COLUMN IF NOT EXISTS "valor" DECIMAL(10,2)`
    await prisma.$executeRaw`ALTER TABLE contact_forms ADD COLUMN IF NOT EXISTS "primerLlamadoAt" TIMESTAMPTZ`
    
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