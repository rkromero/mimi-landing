import { NextRequest, NextResponse } from 'next/server'
import { CrmRole } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

type LostReasonKey = 'precio' | 'minorista' | 'en-otro-momento' | 'pago-anticipado' | 'sin-motivo'

const LOST_REASON_LABELS: Record<Exclude<LostReasonKey, 'sin-motivo'>, string> = {
  precio: 'Precio',
  minorista: 'Minorista',
  'en-otro-momento': 'En otro momento',
  'pago-anticipado': 'Pago anticipado',
}

const parseLostReason = (notes?: string | null): LostReasonKey => {
  if (!notes) return 'sin-motivo'
  const match = notes.match(
    /Motivo de perdido:\s*(Precio|Minorista|En otro momento|Pago anticipado)\.?/i
  )
  if (!match) return 'sin-motivo'
  const value = match[1].toLowerCase()
  if (value === 'precio') return 'precio'
  if (value === 'minorista') return 'minorista'
  if (value === 'en otro momento') return 'en-otro-momento'
  if (value === 'pago anticipado') return 'pago-anticipado'
  return 'sin-motivo'
}

const parseDateParam = (param: string | null, fallback: Date): Date => {
  if (!param) return fallback
  const d = new Date(param + 'T00:00:00.000Z')
  return isNaN(d.getTime()) ? fallback : d
}

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAuth(request, [CrmRole.ADMIN])
    if (error) return error

    const { searchParams } = new URL(request.url)

    const defaultTo = new Date()
    defaultTo.setHours(23, 59, 59, 999)
    const defaultFrom = new Date()
    defaultFrom.setDate(defaultFrom.getDate() - 6)
    defaultFrom.setHours(0, 0, 0, 0)

    const dateFrom = parseDateParam(searchParams.get('dateFrom'), defaultFrom)
    const dateTo = parseDateParam(searchParams.get('dateTo'), defaultTo)
    dateTo.setHours(23, 59, 59, 999)

    const [sellers, leads] = await Promise.all([
      prisma.crmUser.findMany({
        where: { role: CrmRole.VENDEDOR },
        select: { id: true, name: true, email: true },
        orderBy: { name: 'asc' },
      }),
      prisma.contactForm.findMany({
        where: {
          esBajoVolumen: false,
          createdAt: { gte: dateFrom, lte: dateTo },
        },
        select: {
          id: true,
          assignedToId: true,
          etapaCrm: true,
          notas: true,
          createdAt: true,
          updatedAt: true,
          primerLlamadoAt: true,
        },
      }),
    ])

    // Build leadsByDay covering the full selected range
    const msPerDay = 24 * 60 * 60 * 1000
    const fromMidnight = new Date(dateFrom)
    fromMidnight.setUTCHours(0, 0, 0, 0)
    const toMidnight = new Date(dateTo)
    toMidnight.setUTCHours(0, 0, 0, 0)
    const totalDays = Math.round((toMidnight.getTime() - fromMidnight.getTime()) / msPerDay) + 1

    const leadsByDayMap = new Map<string, number>()
    for (const lead of leads) {
      const key = lead.createdAt.toISOString().slice(0, 10)
      leadsByDayMap.set(key, (leadsByDayMap.get(key) ?? 0) + 1)
    }

    const leadsByDay = Array.from({ length: totalDays }).map((_, index) => {
      const d = new Date(fromMidnight)
      d.setUTCDate(d.getUTCDate() + index)
      const key = d.toISOString().slice(0, 10)
      return { date: key, count: leadsByDayMap.get(key) ?? 0 }
    })

    const sellersMetrics = sellers.map((seller) => {
      const sellerLeads = leads.filter((lead) => lead.assignedToId === seller.id)
      const ganados = sellerLeads.filter((lead) => lead.etapaCrm === 'ganado').length
      const perdidosLeads = sellerLeads.filter((lead) => lead.etapaCrm === 'perdido')
      const perdidos = perdidosLeads.length
      const total = sellerLeads.length

      const reasonsCount: Record<LostReasonKey, number> = {
        precio: 0,
        minorista: 0,
        'en-otro-momento': 0,
        'pago-anticipado': 0,
        'sin-motivo': 0,
      }
      for (const lead of perdidosLeads) {
        reasonsCount[parseLostReason(lead.notas)] += 1
      }

      const reasonPercentages = {
        precio: perdidos > 0 ? (reasonsCount.precio / perdidos) * 100 : 0,
        minorista: perdidos > 0 ? (reasonsCount.minorista / perdidos) * 100 : 0,
        'en-otro-momento': perdidos > 0 ? (reasonsCount['en-otro-momento'] / perdidos) * 100 : 0,
        'pago-anticipado': perdidos > 0 ? (reasonsCount['pago-anticipado'] / perdidos) * 100 : 0,
        'sin-motivo': perdidos > 0 ? (reasonsCount['sin-motivo'] / perdidos) * 100 : 0,
      }

      const leadTimesToFirstCallMs = sellerLeads
        .filter((lead) => {
          if (lead.primerLlamadoAt) return true
          if (lead.etapaCrm === 'primer-llamado') return true
          return false
        })
        .map((lead) => {
          if (lead.primerLlamadoAt) {
            return Math.max(0, lead.primerLlamadoAt.getTime() - lead.createdAt.getTime())
          }
          return Math.max(0, lead.updatedAt.getTime() - lead.createdAt.getTime())
        })

      const averageMsToFirstTouch =
        leadTimesToFirstCallMs.length > 0
          ? leadTimesToFirstCallMs.reduce((sum, v) => sum + v, 0) / leadTimesToFirstCallMs.length
          : null

      return {
        sellerId: seller.id,
        sellerName: seller.name,
        sellerEmail: seller.email,
        totalLeads: total,
        ganados,
        perdidos,
        conversionRate: total > 0 ? (ganados / total) * 100 : 0,
        lostRate: total > 0 ? (perdidos / total) * 100 : 0,
        lostReasonPercentages: reasonPercentages,
        averageHoursToFirstTouch:
          averageMsToFirstTouch !== null ? averageMsToFirstTouch / 1000 / 60 / 60 : null,
      }
    })

    const avgDailyInRange = totalDays > 0 ? leads.length / totalDays : 0

    return NextResponse.json({
      summary: {
        totalLeads: leads.length,
        avgDailyInRange,
        dateFrom: dateFrom.toISOString().slice(0, 10),
        dateTo: dateTo.toISOString().slice(0, 10),
      },
      leadsByDay,
      sellersMetrics,
      lostReasonLabels: LOST_REASON_LABELS,
      notes: {
        firstTouchTime:
          'Promedio del tiempo desde creación hasta primer llamado. Se registra el momento exacto al pasar a primer-llamado.',
      },
    })
  } catch (error) {
    console.error('Error construyendo dashboard admin:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
