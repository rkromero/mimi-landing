import { NextRequest, NextResponse } from 'next/server'
import { CrmRole } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { hashPassword, requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAuth(request, [CrmRole.ADMIN, CrmRole.VENDEDOR])
    if (error) return error

    const sellers = await prisma.crmUser.findMany({
      where: { role: CrmRole.VENDEDOR },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ users: sellers })
  } catch (error) {
    console.error('Error al listar vendedores:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { auth, error } = await requireAuth(request, [CrmRole.ADMIN])
    if (error) return error

    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: 'JSON invalido' }, { status: 400 })
    }

    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const password = typeof body.password === 'string' ? body.password : ''

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'name, email y password son requeridos' }, { status: 400 })
    }

    if (password.length < 10) {
      return NextResponse.json({ error: 'Password debe tener al menos 10 caracteres' }, { status: 400 })
    }

    const existingUser = await prisma.crmUser.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'Ya existe un usuario con ese email' }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)
    const user = await prisma.crmUser.create({
      data: {
        name,
        email,
        passwordHash,
        role: CrmRole.VENDEDOR,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })

    return NextResponse.json({
      success: true,
      createdBy: auth.user.id,
      user,
    })
  } catch (error) {
    console.error('Error al crear vendedor:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
