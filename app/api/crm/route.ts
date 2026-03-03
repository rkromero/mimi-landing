import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

const CRM_ETAPAS = ['entrante', 'primer-llamado', 'seguimiento', 'ganado', 'perdido'] as const

const isCrmEtapa = (value: unknown): value is (typeof CRM_ETAPAS)[number] =>
  typeof value === 'string' && CRM_ETAPAS.includes(value as (typeof CRM_ETAPAS)[number])

const parseJsonBody = async (request: NextRequest) => {
  try {
    return await request.json()
  } catch {
    return null
  }
}

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
      entrante: [] as ReturnType<typeof transformLead>[],
      'primer-llamado': [] as ReturnType<typeof transformLead>[],
      seguimiento: [] as ReturnType<typeof transformLead>[],
      ganado: [] as ReturnType<typeof transformLead>[],
      perdido: [] as ReturnType<typeof transformLead>[],
    }

    for (const lead of leads) {
      const etapa = isCrmEtapa(lead.etapaCrm) ? lead.etapaCrm : 'entrante'
      leadsPorEtapa[etapa].push(transformLead(lead))
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
    const body = await parseJsonBody(request)
    if (!body) {
      return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
    }

    const { leadId, nuevaEtapa, notas, valor } = body

    if (typeof leadId !== 'string' || !leadId.trim()) {
      return NextResponse.json(
        { error: 'leadId es requerido' },
        { status: 400 }
      )
    }

    if (!isCrmEtapa(nuevaEtapa)) {
      return NextResponse.json(
        { error: 'nuevaEtapa inválida' },
        { status: 400 }
      )
    }

    let parsedValor: number | undefined
    if (valor !== undefined && valor !== null && valor !== '') {
      parsedValor = Number(valor)
      if (!Number.isFinite(parsedValor) || parsedValor < 0) {
        return NextResponse.json(
          { error: 'valor inválido' },
          { status: 400 }
        )
      }
    }

    const normalizedNotas =
      typeof notas === 'string' ? (notas.trim() ? notas.trim() : null) : undefined

    const leadActualizado = await prisma.contactForm.update({
      where: { id: leadId.trim() },
      data: {
        etapaCrm: nuevaEtapa,
        ...(normalizedNotas !== undefined && { notas: normalizedNotas }),
        ...(parsedValor !== undefined && { valor: parsedValor }),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      lead: leadActualizado
    })
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Lead no encontrado' },
        { status: 404 }
      )
    }

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
    const body = await parseJsonBody(request)
    if (!body) {
      return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
    }

    const { leadId } = body

    if (typeof leadId !== 'string' || !leadId.trim()) {
      return NextResponse.json(
        { error: 'leadId es requerido' },
        { status: 400 }
      )
    }

    // Verificar que el lead existe antes de eliminarlo
    const leadExistente = await prisma.contactForm.findUnique({
      where: { id: leadId.trim() }
    })

    if (!leadExistente) {
      return NextResponse.json(
        { error: 'Lead no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar el lead
    await prisma.contactForm.delete({
      where: { id: leadId.trim() }
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