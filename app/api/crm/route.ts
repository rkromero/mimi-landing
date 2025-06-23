import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Obtener todos los leads organizados por etapa
export async function GET() {
  try {
    const leads = await prisma.contactForm.findMany({
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // Organizar leads por etapa
    const leadsPorEtapa = {
      entrante: leads.filter((lead: any) => lead.etapaCrm === 'entrante'),
      'primer-llamado': leads.filter((lead: any) => lead.etapaCrm === 'primer-llamado'),
      seguimiento: leads.filter((lead: any) => lead.etapaCrm === 'seguimiento'),
      ganado: leads.filter((lead: any) => lead.etapaCrm === 'ganado'),
      perdido: leads.filter((lead: any) => lead.etapaCrm === 'perdido'),
    }

    return NextResponse.json(leadsPorEtapa)
  } catch (error) {
    console.error('Error al obtener leads del CRM:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT: Actualizar etapa de un lead
export async function PUT(request: NextRequest) {
  try {
    const { leadId, nuevaEtapa, notas, valor } = await request.json()

    if (!leadId || !nuevaEtapa) {
      return NextResponse.json(
        { error: 'leadId y nuevaEtapa son requeridos' },
        { status: 400 }
      )
    }

    const leadActualizado = await prisma.contactForm.update({
      where: { id: leadId },
      data: {
        etapaCrm: nuevaEtapa,
        ...(notas && { notas }),
        ...(valor && { valor: parseFloat(valor) }),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      lead: leadActualizado
    })
  } catch (error) {
    console.error('Error al actualizar lead:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 