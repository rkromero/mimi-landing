'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { ArrowLeft, Settings, Shuffle, User, CheckCircle2 } from 'lucide-react'

type Seller = { id: string; name: string; email: string }

type Config = {
  assignmentMode: 'balanced' | 'fixed'
  fixedAssigneeId: string | null
  fixedAssigneeName: string | null
  sellers: Seller[]
}

export default function ConfiguracionPage() {
  const router = useRouter()
  const [config, setConfig] = useState<Config | null>(null)
  const [mode, setMode] = useState<'balanced' | 'fixed'>('balanced')
  const [fixedId, setFixedId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      const me = await fetch('/api/auth/me')
      if (!me.ok) { router.replace('/crm/login'); return }
      const { user } = await me.json()
      if (user.role !== 'ADMIN') { router.replace('/crm'); return }

      const res = await fetch('/api/crm/config')
      if (!res.ok) {
        toast({ title: 'No se pudo cargar la configuración', variant: 'destructive' })
        setLoading(false)
        return
      }
      const data: Config = await res.json()
      setConfig(data)
      setMode(data.assignmentMode)
      setFixedId(data.fixedAssigneeId ?? '')
      setLoading(false)
    }
    void load()
  }, [router])

  const handleSave = async () => {
    if (mode === 'fixed' && !fixedId) {
      toast({ title: 'Seleccioná un vendedor', variant: 'destructive' })
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/crm/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentMode: mode, fixedAssigneeId: fixedId || null }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast({ title: data.error ?? 'Error al guardar', variant: 'destructive' })
        return
      }

      toast({ title: 'Configuración guardada' })
    } catch {
      toast({ title: 'Error de conexión', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const selectedSeller = config?.sellers.find((s) => s.id === fixedId)

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050814] to-[#070d1f] text-slate-100">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/crm"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al CRM
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center">
              <Settings className="h-5 w-5 text-brand-orange" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Configuración</h1>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Solo visible para administradores</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-500 text-sm">Cargando...</div>
        ) : (
          <Card className="bg-[#0b1328]/60 border-white/8 backdrop-blur-md shadow-2xl">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-300">
                Reglas de derivación de leads
              </CardTitle>
              <p className="text-xs text-slate-500 mt-1">
                Definí cómo se asignan los nuevos leads a los vendedores cuando llegan por el formulario.
              </p>
            </CardHeader>

            <CardContent className="pt-6 space-y-5">

              {/* Opción: round-robin */}
              <button
                onClick={() => setMode('balanced')}
                className={`w-full text-left flex items-start gap-4 p-4 rounded-xl border transition-all ${
                  mode === 'balanced'
                    ? 'border-brand-orange/40 bg-brand-orange/5'
                    : 'border-white/8 hover:border-white/15 bg-transparent'
                }`}
              >
                <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  mode === 'balanced' ? 'border-brand-orange' : 'border-slate-600'
                }`}>
                  {mode === 'balanced' && <div className="w-2 h-2 rounded-full bg-brand-orange" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Shuffle className="h-4 w-4 text-slate-400" />
                    <span className="font-semibold text-sm text-slate-100">Distribución automática</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Los leads se reparten en round-robin entre todos los vendedores activos,
                    priorizando al que tiene menos leads en los últimos 30 días.
                  </p>
                </div>
              </button>

              {/* Opción: vendedor fijo */}
              <button
                onClick={() => setMode('fixed')}
                className={`w-full text-left flex items-start gap-4 p-4 rounded-xl border transition-all ${
                  mode === 'fixed'
                    ? 'border-brand-orange/40 bg-brand-orange/5'
                    : 'border-white/8 hover:border-white/15 bg-transparent'
                }`}
              >
                <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  mode === 'fixed' ? 'border-brand-orange' : 'border-slate-600'
                }`}>
                  {mode === 'fixed' && <div className="w-2 h-2 rounded-full bg-brand-orange" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-4 w-4 text-slate-400" />
                    <span className="font-semibold text-sm text-slate-100">Asignar siempre a un vendedor</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed mb-3">
                    Todos los leads nuevos van al mismo vendedor, sin importar el volumen.
                  </p>

                  {mode === 'fixed' && (
                    <Select value={fixedId} onValueChange={setFixedId}>
                      <SelectTrigger
                        className="bg-[#0f1932] border-slate-700/60 text-slate-100 h-9 text-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <SelectValue placeholder="Seleccioná un vendedor..." />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0b1328] border-slate-700 text-slate-200">
                        {config?.sellers.length === 0 && (
                          <SelectItem value="__none__" disabled>
                            No hay vendedores creados
                          </SelectItem>
                        )}
                        {config?.sellers.map((seller) => (
                          <SelectItem key={seller.id} value={seller.id}>
                            {seller.name}
                            <span className="text-slate-500 ml-1 text-xs">({seller.email})</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </button>

              {/* Resumen del estado actual */}
              {config && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/3 border border-white/5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
                  <p className="text-xs text-slate-500">
                    {config.assignmentMode === 'fixed' && config.fixedAssigneeName
                      ? <>Actualmente todos los leads van a <span className="text-slate-300 font-medium">{config.fixedAssigneeName}</span></>
                      : <>Actualmente los leads se distribuyen automáticamente entre los vendedores</>
                    }
                  </p>
                </div>
              )}

              {/* Botón guardar */}
              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleSave}
                  disabled={saving || (mode === 'fixed' && !fixedId)}
                  className="bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold px-6"
                >
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </div>

            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
