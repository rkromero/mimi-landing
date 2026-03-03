import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import { CrmRole } from '@prisma/client'
import { requireAuth } from '@/lib/auth'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAuth(request, [CrmRole.ADMIN])
    if (error) return error

    if (process.env.ENABLE_DB_ADMIN_ENDPOINTS !== 'true') {
      return NextResponse.json(
        { error: 'Endpoint deshabilitado en este entorno' },
        { status: 403 }
      )
    }

    console.log('🔧 Iniciando configuración de base de datos...')
    
    // Verificar que tenemos DATABASE_URL
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'DATABASE_URL no configurada' },
        { status: 500 }
      )
    }

    console.log('📊 DATABASE_URL configurada:', process.env.DATABASE_URL.substring(0, 30) + '...')

    // Ejecutar prisma db push
    console.log('🚀 Ejecutando prisma db push...')
    const { stdout, stderr } = await execAsync('npx prisma db push')
    
    console.log('✅ Stdout:', stdout)
    if (stderr) {
      console.log('⚠️ Stderr:', stderr)
    }

    return NextResponse.json({
      success: true,
      message: 'Base de datos configurada exitosamente',
      stdout,
      stderr: stderr || null
    })

  } catch (error) {
    console.error('❌ Error configurando base de datos:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Error configurando base de datos',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 