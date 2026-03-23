import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CrmRole } from '@prisma/client'
import { requireAuth } from '@/lib/auth'

const SETTINGS_ID = 'singleton'

// GET: devuelve la configuración actual + lista de vendedores disponibles
export async function GET(request: NextRequest) {
  try {
    const { auth, error } = await requireAuth(request, [CrmRole.ADMIN])
    if (error) return error

    const [settings, sellers] = await Promise.all([
      prisma.crmSettings.findUnique({
        where: { id: SETTINGS_ID },
        include: { fixedAssignee: { select: { id: true, name: true, email: true } } },
      }),
      prisma.crmUser.findMany({
        where: { role: CrmRole.VENDEDOR },
        select: { id: true, name: true, email: true },
        orderBy: { name: 'asc' },
      }),
    ])

    return NextResponse.json({
      assignmentMode: settings?.assignmentMode ?? 'balanced',
      fixedAssigneeId: settings?.fixedAssigneeId ?? null,
      fixedAssigneeName: settings?.fixedAssignee?.name ?? null,
      sellers,
    })
  } catch (error) {
    console.error('Error al obtener configuración:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PATCH: actualiza la configuración de derivación
export async function PATCH(request: NextRequest) {
  try {
    const { auth, error } = await requireAuth(request, [CrmRole.ADMIN])
    if (error) return error

    const body = await request.json().catch(() => null)
    if (!body) return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })

    const { assignmentMode, fixedAssigneeId } = body

    if (assignmentMode !== 'balanced' && assignmentMode !== 'fixed') {
      return NextResponse.json({ error: 'assignmentMode inválido' }, { status: 400 })
    }

    if (assignmentMode === 'fixed') {
      if (!fixedAssigneeId || typeof fixedAssigneeId !== 'string') {
        return NextResponse.json({ error: 'fixedAssigneeId requerido cuando el modo es fixed' }, { status: 400 })
      }

      const seller = await prisma.crmUser.findUnique({
        where: { id: fixedAssigneeId },
        select: { id: true, role: true },
      })

      if (!seller || seller.role !== CrmRole.VENDEDOR) {
        return NextResponse.json({ error: 'Vendedor no válido' }, { status: 400 })
      }
    }

    const updated = await prisma.crmSettings.upsert({
      where: { id: SETTINGS_ID },
      create: {
        id: SETTINGS_ID,
        assignmentMode,
        fixedAssigneeId: assignmentMode === 'fixed' ? fixedAssigneeId : null,
      },
      update: {
        assignmentMode,
        fixedAssigneeId: assignmentMode === 'fixed' ? fixedAssigneeId : null,
      },
      include: { fixedAssignee: { select: { id: true, name: true, email: true } } },
    })

    return NextResponse.json({
      success: true,
      assignmentMode: updated.assignmentMode,
      fixedAssigneeId: updated.fixedAssigneeId,
      fixedAssigneeName: updated.fixedAssignee?.name ?? null,
    })
  } catch (error) {
    console.error('Error al actualizar configuración:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
