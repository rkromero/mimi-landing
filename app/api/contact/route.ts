import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CrmRole, Prisma } from '@prisma/client'
import { getAuthUserFromRequest, requireAuth } from '@/lib/auth'
import { Resend } from 'resend'
import { createEmailTemplate } from '@/lib/email-template'

const ASSIGNMENT_WINDOW_DAYS = 30

const pickBalancedSellerId = async (
  tx: Prisma.TransactionClient,
  sellerIds: string[]
) => {
  if (sellerIds.length === 0) return null

  // Solo contar leads de los últimos N días para ignorar el historial total
  const since = new Date()
  since.setDate(since.getDate() - ASSIGNMENT_WINDOW_DAYS)

  const grouped = await tx.contactForm.groupBy({
    by: ['assignedToId'],
    where: {
      assignedToId: { in: sellerIds },
      createdAt: { gte: since },
    },
    _count: { _all: true },
  })

  const counts = new Map<string, number>()
  for (const sellerId of sellerIds) counts.set(sellerId, 0)
  for (const row of grouped) {
    if (row.assignedToId) {
      counts.set(row.assignedToId, row._count._all)
    }
  }

  const minCount = Math.min(...Array.from(counts.values()))
  const candidates = sellerIds.filter((sellerId) => (counts.get(sellerId) ?? 0) === minCount)
  return candidates[Math.floor(Math.random() * candidates.length)] ?? null
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre, negocio, provincia, localidad, cantidad, etapa, whatsapp, cuit, email, comentarios } = body

    // Validar campos obligatorios
    if (!nombre || !negocio || !provincia || !localidad || !cantidad || !etapa || !whatsapp) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      )
    }

    // Determinar si es un lead de bajo volumen
    const esBajoVolumen = cantidad === 'menos-24'
    const auth = await getAuthUserFromRequest(request)

    const contactForm = await prisma.$transaction(async (tx) => {
      const sellers = await tx.crmUser.findMany({
        where: { role: CrmRole.VENDEDOR },
        select: { id: true },
      })
      const sellerIds = sellers.map((seller) => seller.id)
      const assignedToId = await pickBalancedSellerId(tx, sellerIds)

      return tx.contactForm.create({
        data: {
          nombre,
          negocio,
          provincia,
          localidad,
          cantidad,
          etapa,
          whatsapp,
          cuit: cuit || null,
          email: email || null,
          comentarios: comentarios || null,
          esBajoVolumen,
          assignedToId,
          ...(auth && { updatedByUserId: auth.user.id }),
        },
      })
    })

    // Enviar email si está configurado
    if (process.env.RESEND_API_KEY && process.env.EMAIL_TO) {
      try {
        const emailHtml = createEmailTemplate({
          nombre: contactForm.nombre,
          negocio: contactForm.negocio,
          provincia: contactForm.provincia,
          localidad: contactForm.localidad,
          cantidad: contactForm.cantidad,
          etapa: contactForm.etapa,
          whatsapp: contactForm.whatsapp,
          cuit: contactForm.cuit || undefined,
          email: contactForm.email || undefined,
          comentarios: contactForm.comentarios || undefined,
          createdAt: contactForm.createdAt.toISOString()
        })

        const resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
          from: process.env.EMAIL_FROM || 'MIMI Landing <onboarding@resend.dev>',
          to: process.env.EMAIL_TO.split(','),
          subject: `🎯 Nuevo Lead: ${nombre} - ${negocio}`,
          html: emailHtml,
        })
      } catch (emailError) {
        console.error('Error al enviar email:', emailError)
        // No fallar si el email falla, el formulario ya se guardó
      }
    }

    return NextResponse.json(
      {
        message: 'Formulario enviado exitosamente',
        id: contactForm.id,
        esBajoVolumen
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error al procesar formulario:', error)
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAuth(request, [CrmRole.ADMIN])
    if (error) return error

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