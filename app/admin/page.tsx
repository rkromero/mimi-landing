"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BarChart3, TrendingDown, TrendingUp, Clock3, KanbanSquare, ShieldCheck, LogOut, RefreshCw, CalendarDays } from 'lucide-react'

interface DashboardResponse {
  summary: {
    totalLeads: number
    avgDailyInRange: number
    dateFrom: string
    dateTo: string
  }
  leadsByDay: Array<{
    date: string
    count: number
  }>
  sellersMetrics: Array<{
    sellerId: string
    sellerName: string
    sellerEmail: string
    totalLeads: number
    ganados: number
    perdidos: number
    conversionRate: number
    lostRate: number
    lostReasonPercentages: {
      precio: number
      minorista: number
      'en-otro-momento': number
      'pago-anticipado': number
      'sin-motivo': number
    }
    averageHoursToFirstTouch: number | null
  }>
  notes: {
    firstTouchTime: string
  }
}

const toDateStr = (d: Date) => d.toISOString().slice(0, 10)

const getPresetDates = (preset: string): { from: string; to: string } => {
  const to = new Date()
  const from = new Date()
  if (preset === '7d') {
    from.setDate(from.getDate() - 6)
  } else if (preset === '30d') {
    from.setDate(from.getDate() - 29)
  } else if (preset === 'month') {
    from.setDate(1)
  }
  return { from: toDateStr(from), to: toDateStr(to) }
}

export default function AdminPage() {
  const router = useRouter()
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [preset, setPreset] = useState<'7d' | '30d' | 'month' | 'custom'>('7d')
  const defaultDates = getPresetDates('7d')
  const [dateFrom, setDateFrom] = useState(defaultDates.from)
  const [dateTo, setDateTo] = useState(defaultDates.to)

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.replace('/crm/login?next=/admin')
    router.refresh()
  }

  useEffect(() => {
    void fetchAll()
  }, [])

  const fetchAll = async (from = dateFrom, to = dateTo) => {
    try {
      setLoading(true)
      const meResponse = await fetch('/api/auth/me')
      if (!meResponse.ok) {
        router.replace('/crm/login?next=/admin')
        return
      }
      const meData = await meResponse.json()
      if (meData?.user?.role !== 'ADMIN') {
        router.replace('/crm')
        return
      }
      await fetchDashboard(from, to)
    } finally {
      setLoading(false)
    }
  }

  const fetchDashboard = async (from = dateFrom, to = dateTo) => {
    try {
      const response = await fetch(`/api/admin/dashboard?dateFrom=${from}&dateTo=${to}`)
      if (!response.ok) return
      const data = (await response.json()) as DashboardResponse
      setDashboard(data)
    } catch (error) {
      console.error('Error al cargar dashboard:', error)
    }
  }

  const applyPreset = (p: '7d' | '30d' | 'month') => {
    const dates = getPresetDates(p)
    setPreset(p)
    setDateFrom(dates.from)
    setDateTo(dates.to)
    void fetchDashboard(dates.from, dates.to)
  }

  const applyCustom = () => {
    void fetchDashboard(dateFrom, dateTo)
  }

  const formatHours = (hours: number | null) => {
    if (hours === null) return 'Sin datos'
    if (hours < 1) return `${Math.round(hours * 60)} min`
    return `${hours.toFixed(1)} h`
  }

  const formatDateLabel = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
  }

  const maxLeadsPerDay = Math.max(...(dashboard?.leadsByDay.map((item) => item.count) ?? [1]), 1)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070d1f] flex items-center justify-center text-slate-200">
        <div className="text-lg">Cargando dashboard admin...</div>
      </div>
    )
  }

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-b from-[#050814] to-[#070d1f] text-slate-100">
      <div className="flex h-full">
        <aside className="hidden lg:flex w-64 flex-col border-r border-white/10 bg-[#080c1a]">
          <div className="h-14 px-4 border-b border-white/10 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
            <span className="text-sm font-semibold tracking-wide">MIMI CRM</span>
          </div>

          <nav className="px-3 py-4 space-y-1">
            <Link
              href="/crm"
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-slate-300 hover:bg-white/5 border border-transparent hover:border-white/10 text-sm transition-colors"
            >
              <KanbanSquare className="h-4 w-4" />
              CRM
            </Link>
            <Link
              href="/admin"
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-sm"
            >
              <ShieldCheck className="h-4 w-4" />
              Admin
            </Link>
          </nav>

          <div className="mt-auto p-3 border-t border-white/10">
            <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-white/5">
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar sesión
            </Button>
          </div>
        </aside>

        <main className="flex-1 min-w-0 h-full overflow-hidden flex flex-col">
          <div className="h-14 border-b border-white/10 bg-[#0a1123]/85 backdrop-blur px-4 md:px-6 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-400">Panel</p>
              <h1 className="text-base font-semibold text-slate-100">Admin Dashboard</h1>
            </div>
            <Button onClick={() => fetchAll()} variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {/* Filtro de fechas */}
          <div className="border-b border-white/10 bg-[#080c1a] px-4 md:px-6 py-3 flex flex-wrap items-center gap-3">
            <CalendarDays className="h-4 w-4 text-slate-400 shrink-0" />
            <div className="flex gap-1">
              {(['7d', '30d', 'month'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => applyPreset(p)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${preset === p
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                    }`}
                >
                  {p === '7d' ? 'Última semana' : p === '30d' ? 'Últimos 30 días' : 'Este mes'}
                </button>
              ))}
              <button
                onClick={() => setPreset('custom')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${preset === 'custom'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                  }`}
              >
                Personalizado
              </button>
            </div>

            {preset === 'custom' && (
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-7 w-36 bg-[#0b1328] border-white/20 text-slate-200 text-xs"
                />
                <span className="text-slate-500 text-xs">→</span>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-7 w-36 bg-[#0b1328] border-white/20 text-slate-200 text-xs"
                />
                <Button onClick={applyCustom} size="sm" className="h-7 bg-[#E65C37] hover:bg-[#E65C37]/90 text-white text-xs px-3">
                  Aplicar
                </Button>
              </div>
            )}

            {dashboard && preset !== 'custom' && (
              <span className="text-xs text-slate-500 ml-auto">
                {formatDateLabel(dashboard.summary.dateFrom)} – {formatDateLabel(dashboard.summary.dateTo)}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto crm-scrollbar px-4 md:px-6 py-4">
            {dashboard ? (
              <div className="grid gap-6 mb-8">
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="bg-[#0b1328] border-white/10 text-slate-100">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-slate-400">Leads en el período</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{dashboard.summary.totalLeads}</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#0b1328] border-white/10 text-slate-100">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-slate-400">Promedio diario</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{dashboard.summary.avgDailyInRange.toFixed(1)}</div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-[#0b1328]/40 backdrop-blur-md border-white/5 text-slate-100 shadow-2xl overflow-hidden group hover:border-brand-orange/20 transition-all">
                  <CardHeader className="border-b border-white/5 bg-white/5">
                    <CardTitle className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-white">
                      <BarChart3 className="h-4 w-4 text-brand-orange" />
                      Leads creados por día
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-8 pb-4">
                    <div
                      className="grid gap-2 items-end h-32"
                      style={{ gridTemplateColumns: `repeat(${dashboard.leadsByDay.length}, minmax(0, 1fr))` }}
                    >
                      {dashboard.leadsByDay.map((item) => (
                        <div key={item.date} className="group relative flex flex-col items-center justify-end h-full">
                          <div
                            className="w-full rounded-full bg-gradient-to-t from-brand-orange/40 to-brand-orange hover:from-brand-orange hover:to-[#ff8c00] transition-all duration-300 shadow-lg shadow-brand-orange/10"
                            style={{ height: `${Math.max(8, (item.count / maxLeadsPerDay) * 100)}%` }}
                          />
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-xl bg-brand-orange text-white text-[10px] font-black italic shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-10 scale-90 group-hover:scale-100 origin-bottom">
                            {formatDateLabel(item.date)}
                            <div className="mt-0.5 pt-0.5 border-t border-white/20 text-center">{item.count} leads</div>
                            <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-brand-orange rotate-45" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#0b1328]/40 backdrop-blur-md border-white/5 text-slate-100 shadow-2xl group hover:border-brand-teal/20 transition-all">
                  <CardHeader className="border-b border-white/5 bg-white/5">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-3">
                      <TrendingUp className="h-4 w-4 text-brand-teal" />
                      Comparativa por vendedor
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    {dashboard.sellersMetrics.length === 0 ? (
                      <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No hay vendedores para comparar.</p>
                      </div>
                    ) : (
                      dashboard.sellersMetrics.map((seller) => (
                        <div key={seller.sellerId} className="rounded-2xl border border-white/5 bg-white/5 p-6 space-y-4 hover:border-white/10 transition-all group/card shadow-xl">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-xl font-black italic text-white shadow-lg">
                                {seller.sellerName[0]}
                              </div>
                              <div>
                                <p className="font-black italic text-white group-hover/card:text-brand-orange transition-colors">{seller.sellerName}</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{seller.sellerEmail}</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="bg-brand-orange/10 border-brand-orange/20 text-brand-orange font-black px-3 py-1">
                              LEADS: {seller.totalLeads}
                            </Badge>
                          </div>

                          <div className="grid md:grid-cols-3 gap-4 text-sm font-bold">
                            <div className="rounded-2xl bg-brand-teal/5 text-brand-teal p-4 border border-brand-teal/10 shadow-inner group/stat">
                              <p className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-black mb-1 opacity-60 group-hover/stat:opacity-100 transition-opacity">
                                <TrendingUp className="h-3 w-3" />
                                Conversión
                              </p>
                              <p className="text-2xl font-black italic">{seller.conversionRate.toFixed(1)}%</p>
                              <p className="text-[10px] font-medium mt-1 uppercase">Ganados: {seller.ganados}</p>
                            </div>
                            <div className="rounded-2xl bg-red-500/5 text-red-400 p-4 border border-red-500/10 shadow-inner group/stat">
                              <p className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-black mb-1 opacity-60 group-hover/stat:opacity-100 transition-opacity">
                                <TrendingDown className="h-3 w-3" />
                                Perdidos
                              </p>
                              <p className="text-2xl font-black italic">{seller.lostRate.toFixed(1)}%</p>
                              <p className="text-[10px] font-medium mt-1 uppercase">Perdidos: {seller.perdidos}</p>
                            </div>
                            <div className="rounded-2xl bg-brand-orange/5 text-brand-orange p-4 border border-brand-orange/10 shadow-inner group/stat">
                              <p className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-black mb-1 opacity-60 group-hover/stat:opacity-100 transition-opacity">
                                <Clock3 className="h-3 w-3" />
                                Respuesta
                              </p>
                              <p className="text-2xl font-black italic">{formatHours(seller.averageHoursToFirstTouch)}</p>
                              <p className="text-[10px] font-medium mt-1 uppercase tracking-tighter italic opacity-60">Tiempo a 1º llamado</p>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-white/5">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Motivos de pérdida</p>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                              {Object.entries({
                                Precio: seller.lostReasonPercentages.precio,
                                Minorista: seller.lostReasonPercentages.minorista,
                                'En otro momento': seller.lostReasonPercentages['en-otro-momento'],
                                'Pago anticipado': seller.lostReasonPercentages['pago-anticipado'],
                                'Sin motivo': seller.lostReasonPercentages['sin-motivo']
                              }).map(([label, value]) => (
                                <div key={label} className="rounded-xl bg-[#0b1328] border border-white/5 p-3 text-center group/reason hover:border-brand-orange/30 transition-all">
                                  <p className="text-[9px] font-black uppercase text-slate-500 group-hover/reason:text-slate-300 transition-colors">{label}</p>
                                  <p className="text-sm font-black italic text-white mt-1">{value.toFixed(1)}%</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-right mt-4 italic opacity-0 hover:opacity-100 transition-opacity">{dashboard.notes.firstTouchTime}</p>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  )
}
