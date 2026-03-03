import { NextRequest, NextResponse } from 'next/server'
import { clearSessionCookie, getSessionToken, invalidateSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const token = getSessionToken(request)
    if (token) {
      await invalidateSession(token)
    }

    const response = NextResponse.json({ success: true })
    clearSessionCookie(response)
    return response
  } catch (error) {
    console.error('Error en logout:', error)
    const response = NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    clearSessionCookie(response)
    return response
  }
}
