import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { nombre, negocio, ubicacion, cantidad, etapa, whatsapp, email, comentarios } = body

    // Validar campos obligatorios
    if (!nombre || !negocio || !ubicacion || !etapa || !whatsapp) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      )
    }

    // Guardar en la base de datos
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

    return NextResponse.json(
      { message: 'Formulario enviado exitosamente', id: contactForm.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error al procesar formulario:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
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