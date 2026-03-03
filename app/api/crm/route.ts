import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CrmRole, Prisma } from '@prisma/client'
import { requireAuth } from '@/lib/auth'

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
export async function GET(request: NextRequest) {
  try {
    const { auth, error } = await requireAuth(request, [CrmRole.ADMIN, CrmRole.VENDEDOR])
    if (error) return error

    const leads = await prisma.contactForm.findMany({
      where: {
        esBajoVolumen: false, // Excluir leads de bajo volumen del CRM
        ...(auth.user.role === CrmRole.VENDEDOR && { assignedToId: auth.user.id }),
      },
      orderBy: {
        updatedAt: 'desc'
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Transformar y organizar leads por etapa
    const transformLead = (
      lead: typeof leads[number]
    ) => ({
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
      assignedToId: lead.assignedToId,
      assignedToName: lead.assignedTo?.name ?? null,
      assignedToEmail: lead.assignedTo?.email ?? null,
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
    const { auth, error } = await requireAuth(request, [CrmRole.ADMIN, CrmRole.VENDEDOR])
    if (error) return error

    const body = await parseJsonBody(request)
    if (!body) {
      return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
    }

    const { leadId, nuevaEtapa, notas, valor, assignedToId } = body

    if (typeof leadId !== 'string' || !leadId.trim()) {
      return NextResponse.json(
        { error: 'leadId es requerido' },
        { status: 400 }
      )
    }

    if (nuevaEtapa !== undefined && !isCrmEtapa(nuevaEtapa)) {
      return NextResponse.json(
        { error: 'nuevaEtapa inválida' },
        { status: 400 }
      )
    }

    if (nuevaEtapa === undefined && notas === undefined && valor === undefined && assignedToId === undefined) {
      return NextResponse.json(
        { error: 'No hay cambios para aplicar' },
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

    const trimmedLeadId = leadId.trim()
    const existingLead = await prisma.contactForm.findUnique({
      where: { id: trimmedLeadId },
      select: {
        id: true,
        assignedToId: true,
      },
    })

    if (!existingLead) {
      return NextResponse.json(
        { error: 'Lead no encontrado' },
        { status: 404 }
      )
    }

    if (auth.user.role === CrmRole.VENDEDOR && existingLead.assignedToId !== auth.user.id) {
      return NextResponse.json(
        { error: 'No autorizado para editar este lead' },
        { status: 403 }
      )
    }

    let normalizedAssignedToId: string | null | undefined
    if (assignedToId !== undefined) {
      if (auth.user.role !== CrmRole.ADMIN) {
        return NextResponse.json(
          { error: 'Solo admin puede asignar vendedores' },
          { status: 403 }
        )
      }

      if (assignedToId === null || assignedToId === '') {
        normalizedAssignedToId = null
      } else if (typeof assignedToId === 'string') {
        const seller = await prisma.crmUser.findUnique({
          where: { id: assignedToId },
          select: {
            id: true,
            role: true,
          },
        })

        if (!seller || seller.role !== CrmRole.VENDEDOR) {
          return NextResponse.json(
            { error: 'Vendedor inválido' },
            { status: 400 }
          )
        }

        normalizedAssignedToId = seller.id
      } else {
        return NextResponse.json(
          { error: 'assignedToId inválido' },
          { status: 400 }
        )
      }
    }

    const leadActualizado = await prisma.contactForm.update({
      where: { id: trimmedLeadId },
      data: {
        ...(nuevaEtapa !== undefined && { etapaCrm: nuevaEtapa }),
        ...(normalizedNotas !== undefined && { notas: normalizedNotas }),
        ...(parsedValor !== undefined && { valor: parsedValor }),
        ...(normalizedAssignedToId !== undefined && { assignedToId: normalizedAssignedToId }),
        updatedByUserId: auth.user.id,
        updatedAt: new Date()
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      lead: {
        ...leadActualizado,
        assignedToName: leadActualizado.assignedTo?.name ?? null,
        assignedToEmail: leadActualizado.assignedTo?.email ?? null,
      },
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
    const { auth, error } = await requireAuth(request, [CrmRole.ADMIN, CrmRole.VENDEDOR])
    if (error) return error

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

    if (auth.user.role === CrmRole.VENDEDOR) {
      return NextResponse.json(
        { error: 'Solo admin puede eliminar leads' },
        { status: 403 }
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