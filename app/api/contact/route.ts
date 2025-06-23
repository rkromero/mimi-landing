import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Iniciando procesamiento de formulario...')
    
    const body = await request.json()
    console.log('📝 Datos recibidos:', { ...body, whatsapp: body.whatsapp ? '***' : undefined })
    
    const { nombre, negocio, ubicacion, cantidad, etapa, whatsapp, email, comentarios } = body

    // Validar campos obligatorios
    if (!nombre || !negocio || !ubicacion || !etapa || !whatsapp) {
      console.log('❌ Faltan campos obligatorios')
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      )
    }

    console.log('🔗 Conectando a la base de datos...')
    
    // Verificar conexión a Prisma
    await prisma.$connect()
    console.log('✅ Conexión a base de datos exitosa')

    // Guardar en la base de datos
    console.log('💾 Guardando en base de datos...')
    const contactForm = await prisma.contactForm.create({
      data: {
        nombre,
        negocio,
        ubicacion,
        cantidad,
        etapa,
        whatsapp,
        email,
        comentarios,
      },
    })

    console.log('✅ Formulario guardado exitosamente:', contactForm.id)
    
    return NextResponse.json(
      { message: 'Formulario enviado exitosamente', id: contactForm.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('❌ Error detallado al procesar formulario:', error)
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack available')
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET() {
  try {
    const forms = await prisma.contactForm.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(forms)
  } catch (error) {
    console.error('Error al obtener formularios:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 