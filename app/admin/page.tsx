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
        <aside className="hidden lg:flex w-72 flex-col p-4">
          <div className="flex flex-col h-full rounded-2xl border border-white/10 bg-[#080c1a]/60 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="h-16 px-6 flex items-center gap-3 border-b border-white/5 bg-white/5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-orange to-brand-orange/60 flex items-center justify-center shadow-lg shadow-brand-orange/20">
                <span className="text-white font-black text-sm tracking-tighter">M</span>
              </div>
              <span className="text-sm font-bold tracking-tight uppercase">Mimi Admin</span>
            </div>

            <div className="flex-1 flex flex-col px-3 py-6">
              <nav className="space-y-1.5">
                <Link
                  href="/crm"
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:bg-white/5 border border-transparent hover:border-white/5 text-sm font-medium transition-all"
                >
                  <KanbanSquare className="h-4 w-4" />
                  Tablero CRM
                </Link>
                <Link
                  href="/admin"
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-brand-orange/10 text-brand-orange border border-brand-orange/20 text-sm font-medium transition-all"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Panel Admin
                </Link>
              </nav>

              <div className="mt-auto px-1">
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="w-full justify-start text-slate-400 hover:text-white hover:bg-white/5 rounded-xl h-11 transition-all"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  <span className="text-sm font-medium">Cerrar sesión</span>
                </Button>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0 h-full overflow-hidden flex flex-col">
          <div className="h-16 border-b border-white/5 bg-[#0a1123]/40 backdrop-blur-lg px-6 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-0.5">Sistema</p>
              <h1 className="text-lg font-bold text-white tracking-tight">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => fetchAll()} variant="outline" size="sm" className="bg-white/5 border-white/10 hover:bg-white/10 text-slate-300 h-9 rounded-xl">
                <RefreshCw className="h-3.5 w-3.5 mr-2" />
                Sincronizar
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-8 crm-scrollbar">
            {/* Filtros Bento */}
            <div className="mb-8 p-1.5 bg-[#080c1a]/60 backdrop-blur border border-white/5 rounded-2xl inline-flex items-center gap-1.5">
              {(['7d', '30d', 'month'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => applyPreset(p)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${preset === p
                    ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                    }`}
                >
                  {p === '7d' ? '7 Días' : p === '30d' ? '30 Días' : 'Este Mes'}
                </button>
              ))}
              <div className="w-px h-4 bg-white/10 mx-1" />
              <button
                onClick={() => setPreset('custom')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${preset === 'custom'
                  ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                  }`}
              >
                Custom
              </button>

              {preset === 'custom' && (
                <div className="flex items-center gap-2 px-3 pl-1">
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="h-8 w-32 bg-white/5 border-white/10 text-white text-[11px] rounded-lg focus:ring-brand-orange/30"
                  />
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="h-8 w-32 bg-white/5 border-white/10 text-white text-[11px] rounded-lg focus:ring-brand-orange/30"
                  />
                  <Button onClick={applyCustom} size="sm" className="h-8 bg-brand-orange hover:bg-brand-orange/90 text-white text-[10px] font-bold px-3 rounded-lg">
                    OK
                  </Button>
                </div>
              )}
            </div>

            {dashboard ? (
              <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6 auto-rows-min">
                {/* Métricas Principales (2x1) */}
                <Card className="md:col-span-2 bg-gradient-to-br from-brand-orange/10 to-transparent border-brand-orange/20 text-slate-100 shadow-xl rounded-[2rem] overflow-hidden">
                  <CardContent className="p-8 flex flex-col justify-between h-full">
                    <div className="flex items-center justify-between mb-8">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange/80">Captación de Leads</p>
                      <TrendingUp className="h-5 w-5 text-brand-orange" />
                    </div>
                    <div>
                      <div className="text-6xl font-black tracking-tighter text-white mb-2">{dashboard.summary.totalLeads}</div>
                      <p className="text-sm font-medium text-slate-400">Total de leads registrados en el periodo seleccionado.</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2 bg-[#0b1328]/40 backdrop-blur-md border-white/5 text-slate-100 shadow-xl rounded-[2rem] overflow-hidden">
                  <CardContent className="p-8 flex flex-col justify-between h-full">
                    <div className="flex items-center justify-between mb-8">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Volumen Diario</p>
                      <BarChart3 className="h-5 w-5 text-slate-500" />
                    </div>
                    <div>
                      <div className="text-6xl font-black tracking-tighter text-white mb-2">{dashboard.summary.avgDailyInRange.toFixed(1)}</div>
                      <p className="text-sm font-medium text-slate-400">Promedio de leads por día durante este rango.</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Gráfico (4x2) */}
                <Card className="md:col-span-4 lg:col-span-6 bg-[#0b1328]/40 backdrop-blur-md border-white/5 text-slate-100 shadow-xl rounded-[2rem] overflow-hidden py-1">
                  <CardHeader className="px-8 pt-6 pb-2 border-b border-white/5 flex flex-row items-center justify-between">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Actividad Cronológica</CardTitle>
                    <span className="text-[10px] font-bold text-slate-500">{formatDateLabel(dashboard.summary.dateFrom)} → {formatDateLabel(dashboard.summary.dateTo)}</span>
                  </CardHeader>
                  <CardContent className="p-8 pt-12">
                    <div
                      className="grid gap-2 items-end h-48"
                      style={{ gridTemplateColumns: `repeat(${dashboard.leadsByDay.length}, minmax(0, 1fr))` }}
                    >
                      {dashboard.leadsByDay.map((item) => (
                        <div key={item.date} className="group relative flex flex-col items-center justify-end h-full">
                          <div
                            className="w-full rounded-full bg-gradient-to-t from-brand-orange/40 to-brand-orange hover:from-brand-orange hover:to-[#ff8c00] transition-all duration-300 shadow-lg shadow-brand-orange/10"
                            style={{ height: `${Math.max(8, (item.count / maxLeadsPerDay) * 100)}%` }}
                          />
                          <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-2 rounded-xl bg-white text-[#050814] text-[10px] font-black shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-10 scale-90 group-hover:scale-100 origin-bottom border border-brand-orange/20 whitespace-nowrap">
                            {formatDateLabel(item.date)}
                            <div className="text-brand-orange text-center">{item.count} leads</div>
                            <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Vendedores Grid */}
                <div className="md:col-span-4 lg:col-span-6 mt-4">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 flex items-center gap-4">
                    <div className="flex-1 h-px bg-white/5" />
                    Métricas por Vendedor
                    <div className="flex-1 h-px bg-white/5" />
                  </h2>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dashboard.sellersMetrics.map((seller) => (
                      <Card key={seller.sellerId} className="bg-[#0b1328]/40 backdrop-blur-md border-white/5 text-slate-100 shadow-xl rounded-[2rem] overflow-hidden group/card hover:border-brand-orange/20 transition-all">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-[#1e293b] flex items-center justify-center text-xl font-black text-white shadow-xl group-hover/card:scale-110 transition-transform">
                              {seller.sellerName[0]}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-white truncate group-hover/card:text-brand-orange transition-colors tracking-tight">{seller.sellerName}</p>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">{seller.sellerEmail}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Leads</p>
                              <p className="text-xl font-black text-white">{seller.totalLeads}</p>
                            </div>
                            <div className="bg-brand-teal/10 rounded-2xl p-4 border border-brand-teal/20">
                              <p className="text-[9px] font-black uppercase tracking-widest text-brand-teal mb-1">Conversión</p>
                              <p className="text-xl font-black text-brand-teal">{seller.conversionRate.toFixed(1)}%</p>
                            </div>
                            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Resp. Prom</p>
                              <p className="text-xl font-black text-white">{formatHours(seller.averageHoursToFirstTouch)}</p>
                            </div>
                            <div className="bg-red-500/10 rounded-2xl p-4 border border-red-500/20">
                              <p className="text-[9px] font-black uppercase tracking-widest text-red-400 mb-1">Perdidos</p>
                              <p className="text-xl font-black text-red-400">{seller.lostRate.toFixed(1)}%</p>
                            </div>
                          </div>

                          <div className="p-4 bg-[#050814]/60 rounded-2xl border border-white/5">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-3 text-center">Top Motivos Perdida</p>
                            <div className="space-y-2">
                              {Object.entries({
                                Precio: seller.lostReasonPercentages.precio,
                                Otro: seller.lostReasonPercentages['en-otro-momento'] + seller.lostReasonPercentages['sin-motivo'],
                                Pago: seller.lostReasonPercentages['pago-anticipado']
                              }).sort((a, b) => b[1] - a[1]).map(([label, val]) => (
                                <div key={label} className="flex items-center justify-between text-[10px] font-medium">
                                  <span className="text-slate-500">{label}</span>
                                  <span className="text-white font-black">{val.toFixed(0)}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  )
}
