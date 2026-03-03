import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE_NAME } from '@/lib/auth-constants'

const PROTECTED_PAGE_PREFIXES = ['/crm', '/admin']
const PROTECTED_API_PREFIXES = ['/api/crm', '/api/users']
const PUBLIC_ROUTES = ['/crm/login', '/api/auth/login']

const isProtectedPage = (pathname: string) =>
  PROTECTED_PAGE_PREFIXES.some((prefix) => pathname.startsWith(prefix))

const isProtectedApi = (pathname: string) =>
  PROTECTED_API_PREFIXES.some((prefix) => pathname.startsWith(prefix))

const isPublicRoute = (pathname: string) => PUBLIC_ROUTES.some((route) => pathname.startsWith(route))

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!isProtectedPage(pathname) && !isProtectedApi(pathname)) {
    return NextResponse.next()
  }

  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value
  if (sessionToken) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const loginUrl = new URL('/crm/login', request.url)
  loginUrl.searchParams.set('next', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/crm/:path*', '/admin/:path*', '/api/crm/:path*', '/api/users/:path*'],
}
