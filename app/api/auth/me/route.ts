import { NextRequest, NextResponse } from 'next/server'
import { clearSessionCookie, getAuthUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUserFromRequest(request)
    if (!auth) {
      const response = NextResponse.json({ error: 'No autenticado' }, { status: 401 })
      clearSessionCookie(response)
      return response
    }

    return NextResponse.json({ user: auth.user })
  } catch (error) {
    console.error('Error obteniendo sesion:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
