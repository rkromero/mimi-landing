import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Obtener todos los leads organizados por etapa
export async function GET() {
  try {
    const leads = await prisma.contactForm.findMany({
      where: {
        esBajoVolumen: false // Excluir leads de bajo volumen del CRM
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // Transformar y organizar leads por etapa
    const transformLead = (lead: any) => ({
      id: lead.id,
      nombre: lead.nombre,
      negocio: lead.negocio,
      provincia: lead.provincia || 'No especificada',
      localidad: lead.localidad || 'No especificada',
      cantidad: lead.cantidad || '24-100',
      etapa: lead.etapa,
      etapaCrm: lead.etapaCrm,
      whatsapp: lead.whatsapp,
      email: lead.email,
      comentarios: lead.comentarios,
      notas: lead.notas,
      valor: lead.valor,
      createdAt: lead.createdAt.toISOString(),
      updatedAt: lead.updatedAt.toISOString()
    })

    const leadsPorEtapa = {
      entrante: leads.filter((lead: any) => lead.etapaCrm === 'entrante').map(transformLead),
      'primer-llamado': leads.filter((lead: any) => lead.etapaCrm === 'primer-llamado').map(transformLead),
      seguimiento: leads.filter((lead: any) => lead.etapaCrm === 'seguimiento').map(transformLead),
      ganado: leads.filter((lead: any) => lead.etapaCrm === 'ganado').map(transformLead),
      perdido: leads.filter((lead: any) => lead.etapaCrm === 'perdido').map(transformLead),
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

// DELETE: Eliminar un lead
export async function DELETE(request: NextRequest) {
  try {
    const { leadId } = await request.json()

    if (!leadId) {
      return NextResponse.json(
        { error: 'leadId es requerido' },
        { status: 400 }
      )
    }

    // Verificar que el lead existe antes de eliminarlo
    const leadExistente = await prisma.contactForm.findUnique({
      where: { id: leadId }
    })

    if (!leadExistente) {
      return NextResponse.json(
        { error: 'Lead no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar el lead
    await prisma.contactForm.delete({
      where: { id: leadId }
    })

    return NextResponse.json({
      success: true,
      message: `Lead eliminado correctamente`
    })
  } catch (error) {
    console.error('Error al eliminar lead:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 