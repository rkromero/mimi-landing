import { randomBytes } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CrmRole } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { SESSION_COOKIE_NAME } from '@/lib/auth-constants'

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7

export interface AuthUser {
  id: string
  email: string
  name: string
  role: CrmRole
}

const toAuthUser = (user: {
  id: string
  email: string
  name: string
  role: CrmRole
}): AuthUser => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
})

const getSessionExpiry = () => new Date(Date.now() + SESSION_TTL_MS)

export const hashPassword = async (password: string) => bcrypt.hash(password, 12)
export const verifyPassword = async (password: string, hash: string) => bcrypt.compare(password, hash)

export const createSession = async (userId: string) => {
  const token = randomBytes(32).toString('hex')
  const expiresAt = getSessionExpiry()

  await prisma.crmSession.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  })

  return { token, expiresAt }
}

export const invalidateSession = async (token: string) => {
  await prisma.crmSession.deleteMany({
    where: { token },
  })
}

export const setSessionCookie = (response: NextResponse, token: string, expiresAt: Date) => {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  })
}

export const clearSessionCookie = (response: NextResponse) => {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
}

export const getSessionToken = (request: NextRequest) => request.cookies.get(SESSION_COOKIE_NAME)?.value ?? null

export const getAuthUserFromRequest = async (request: NextRequest) => {
  const token = getSessionToken(request)
  if (!token) return null

  const session = await prisma.crmSession.findUnique({
    where: { token },
    select: {
      id: true,
      expiresAt: true,
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      },
    },
  })

  if (!session) return null

  if (session.expiresAt <= new Date()) {
    await invalidateSession(token)
    return null
  }

  return {
    token,
    user: toAuthUser(session.user),
  }
}

export const requireAuth = async (request: NextRequest, roles?: CrmRole[]) => {
  const auth = await getAuthUserFromRequest(request)
  if (!auth) {
    return { error: NextResponse.json({ error: 'No autenticado' }, { status: 401 }) as NextResponse }
  }

  if (roles && !roles.includes(auth.user.role)) {
    return { error: NextResponse.json({ error: 'No autorizado' }, { status: 403 }) as NextResponse }
  }

  return { auth }
}
