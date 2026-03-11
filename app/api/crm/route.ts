import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CrmRole, Prisma } from '@prisma/client'
import { requireAuth } from '@/lib/auth'

const CRM_ETAPAS = ['entrante', 'primer-llamado', 'seguimiento', 'muestra-enviada', 'ganado', 'perdido'] as const
const LOST_REASONS = ['precio', 'minorista', 'en-otro-momento', 'pago-anticipado'] as const
const LOST_REASON_LABELS: Record<(typeof LOST_REASONS)[number], string> = {
  precio: 'Precio',
  minorista: 'Minorista',
  'en-otro-momento': 'En otro momento',
  'pago-anticipado': 'Pago anticipado',
}

const isCrmEtapa = (value: unknown): value is (typeof CRM_ETAPAS)[number] =>
  typeof value === 'string' && CRM_ETAPAS.includes(value as (typeof CRM_ETAPAS)[number])
const isLostReason = (value: unknown): value is (typeof LOST_REASONS)[number] =>
  typeof value === 'string' && LOST_REASONS.includes(value as (typeof LOST_REASONS)[number])

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
      select: {
        id: true,
        nombre: true,
        negocio: true,
        provincia: true,
        localidad: true,
        cantidad: true,
        etapa: true,
        etapaCrm: true,
        whatsapp: true,
        email: true,
        comentarios: true,
        notas: true,
        valor: true,
        assignedToId: true,
        createdAt: true,
        updatedAt: true,
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
      'muestra-enviada': [] as ReturnType<typeof transformLead>[],
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

    const {
      leadId,
      nuevaEtapa,
      notas,
      valor,
      assignedToId,
      motivoPerdido,
      nombre,
      negocio,
      provincia,
      localidad,
      whatsapp,
      email,
      comentarios,
      cantidad,
      etapa,
    } = body

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

    if (
      nuevaEtapa === undefined &&
      notas === undefined &&
      valor === undefined &&
      assignedToId === undefined &&
      nombre === undefined &&
      negocio === undefined &&
      provincia === undefined &&
      localidad === undefined &&
      whatsapp === undefined &&
      email === undefined &&
      comentarios === undefined &&
      cantidad === undefined &&
      etapa === undefined
    ) {
      return NextResponse.json(
        { error: 'No hay cambios para aplicar' },
        { status: 400 }
      )
    }

    if (nuevaEtapa === 'perdido' && !isLostReason(motivoPerdido)) {
      return NextResponse.json(
        { error: 'Motivo de perdido obligatorio e inválido' },
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
    const normalizedNombre =
      typeof nombre === 'string' ? nombre.trim() : undefined
    const normalizedNegocio =
      typeof negocio === 'string' ? negocio.trim() : undefined
    const normalizedProvincia =
      typeof provincia === 'string' ? provincia.trim() : undefined
    const normalizedLocalidad =
      typeof localidad === 'string' ? localidad.trim() : undefined
    const normalizedWhatsapp =
      typeof whatsapp === 'string' ? whatsapp.trim() : undefined
    const normalizedEmail =
      typeof email === 'string' ? (email.trim() ? email.trim().toLowerCase() : null) : undefined
    const normalizedComentarios =
      typeof comentarios === 'string' ? (comentarios.trim() ? comentarios.trim() : null) : undefined
    const normalizedCantidad =
      typeof cantidad === 'string' ? cantidad.trim() : undefined
    const normalizedEtapaCompra =
      typeof etapa === 'string' ? etapa.trim() : undefined

    const trimmedLeadId = leadId.trim()
    const existingLead = await prisma.contactForm.findUnique({
      where: { id: trimmedLeadId },
      select: {
        id: true,
        assignedToId: true,
        notas: true,
        etapaCrm: true,
        primerLlamadoAt: true,
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

    const requiredTextFields = [
      { key: 'nombre', value: normalizedNombre },
      { key: 'negocio', value: normalizedNegocio },
      { key: 'provincia', value: normalizedProvincia },
      { key: 'localidad', value: normalizedLocalidad },
      { key: 'whatsapp', value: normalizedWhatsapp },
      { key: 'cantidad', value: normalizedCantidad },
      { key: 'etapa', value: normalizedEtapaCompra },
    ]
    const invalidField = requiredTextFields.find(
      (field) => field.value !== undefined && field.value.length === 0
    )
    if (invalidField) {
      return NextResponse.json(
        { error: `${invalidField.key} no puede estar vacío` },
        { status: 400 }
      )
    }

    const stripLostReason = (value: string | null | undefined) => {
      if (!value) return ''
      return value
        .replace(/\n?Motivo de perdido:\s*(Precio|Minorista|En otro momento|Pago anticipado)\.?/gi, '')
        .trim()
    }

    let finalNotas: string | null | undefined = normalizedNotas
    if (nuevaEtapa !== undefined) {
      const notesBase =
        normalizedNotas !== undefined ? normalizedNotas : (existingLead.notas ?? null)
      const cleanedBase = stripLostReason(notesBase)

      if (nuevaEtapa === 'perdido' && isLostReason(motivoPerdido)) {
        const lostReasonLine = `Motivo de perdido: ${LOST_REASON_LABELS[motivoPerdido]}.`
        finalNotas = cleanedBase ? `${cleanedBase}\n${lostReasonLine}` : lostReasonLine
      } else if (nuevaEtapa !== 'perdido') {
        finalNotas = cleanedBase || null
      }
    }

    const setPrimerLlamadoAt =
      nuevaEtapa === 'primer-llamado' && !existingLead.primerLlamadoAt
        ? { primerLlamadoAt: new Date() }
        : {}

    const leadActualizado = await prisma.contactForm.update({
      where: { id: trimmedLeadId },
      data: {
        ...(nuevaEtapa !== undefined && { etapaCrm: nuevaEtapa }),
        ...setPrimerLlamadoAt,
        ...(finalNotas !== undefined && { notas: finalNotas }),
        ...(parsedValor !== undefined && { valor: parsedValor }),
        ...(normalizedAssignedToId !== undefined && { assignedToId: normalizedAssignedToId }),
        ...(normalizedNombre !== undefined && { nombre: normalizedNombre }),
        ...(normalizedNegocio !== undefined && { negocio: normalizedNegocio }),
        ...(normalizedProvincia !== undefined && { provincia: normalizedProvincia }),
        ...(normalizedLocalidad !== undefined && { localidad: normalizedLocalidad }),
        ...(normalizedWhatsapp !== undefined && { whatsapp: normalizedWhatsapp }),
        ...(normalizedEmail !== undefined && { email: normalizedEmail }),
        ...(normalizedComentarios !== undefined && { comentarios: normalizedComentarios }),
        ...(normalizedCantidad !== undefined && { cantidad: normalizedCantidad }),
        ...(normalizedEtapaCompra !== undefined && { etapa: normalizedEtapaCompra }),
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