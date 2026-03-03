'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import OptimizedLogo from '@/components/OptimizedLogo'

export default function CrmLoginPage() {
  const router = useRouter()
  const [nextPath, setNextPath] = useState('/crm')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      setNextPath(params.get('next') || '/crm')
    }
  }, [])

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          router.replace(nextPath)
        }
      } finally {
        setCheckingSession(false)
      }
    }

    void checkSession()
  }, [nextPath, router])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!email.trim() || !password) {
      toast({
        title: 'Datos incompletos',
        description: 'Ingresa email y password.',
        variant: 'destructive',
      })
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'No se pudo iniciar sesion')
      }

      router.replace(nextPath)
      router.refresh()
    } catch (error) {
      toast({
        title: 'No se pudo iniciar sesion',
        description: error instanceof Error ? error.message : 'Error inesperado',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-sm text-gray-600">Validando sesion...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050814] via-[#0a1123] to-[#070d1f] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#080c1a]/80 backdrop-blur-xl border-white/10 shadow-2xl">
        <CardHeader className="space-y-4 flex flex-col items-center pb-8">
          <OptimizedLogo width={120} height={48} className="h-12 w-auto" />
          <CardTitle className="text-2xl font-bold tracking-tight text-white">Ingreso CRM</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300 text-sm font-medium ml-1">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@empresa.com"
                autoComplete="email"
                required
                className="bg-[#0f1932] border-slate-700/60 text-slate-100 placeholder:text-slate-500 h-11 focus:ring-brand-orange/50 focus:border-brand-orange transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" title="Password" className="text-slate-300 text-sm font-medium ml-1">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
                className="bg-[#0f1932] border-slate-700/60 text-slate-100 h-11 focus:ring-brand-orange/50 focus:border-brand-orange transition-all"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold transition-all shadow-lg shadow-brand-orange/20 active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? 'Ingresando...' : 'Entrar al Panel'}
            </Button>
            <div className="pt-2 text-center">
              <p className="text-xs text-slate-500">
                © {new Date().getFullYear()} MIMI Alfajores. Acceso restringido.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
