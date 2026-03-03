"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BarChart3, TrendingDown, TrendingUp, Clock3 } from 'lucide-react'

interface ContactForm {
  id: string
  nombre: string
  negocio: string
  provincia: string
  localidad: string
  cantidad: string
  etapa: string
  whatsapp: string
  email?: string
  comentarios?: string
  createdAt: string
}

interface DashboardResponse {
  summary: {
    totalLeads: number
    leadsToday: number
    avgDailyLast7Days: number
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

export default function AdminPage() {
  const router = useRouter()
  const [forms, setForms] = useState<ContactForm[]>([])
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.replace('/crm/login?next=/admin')
    router.refresh()
  }


  useEffect(() => {
    void fetchAll()
  }, [])

  const fetchAll = async () => {
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
      await Promise.all([fetchForms(), fetchDashboard()])
    } finally {
      setLoading(false)
    }
  }

  const fetchForms = async () => {
    try {
      const response = await fetch('/api/contact')
      if (response.ok) {
        const data = await response.json()
        setForms(data)
      }
    } catch (error) {
      console.error('Error al cargar formularios:', error)
    }
  }

  const fetchDashboard = async () => {
    try {
      const response = await fetch('/api/admin/dashboard')
      if (!response.ok) return
      const data = (await response.json()) as DashboardResponse
      setDashboard(data)
    } catch (error) {
      console.error('Error al cargar dashboard:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEtapaColor = (etapa: string) => {
    switch (etapa) {
      case 'listo-primer-pedido':
        return 'bg-green-100 text-green-800'
      case 'empezar-pronto':
        return 'bg-yellow-100 text-yellow-800'
      case 'busco-mejor-proveedor':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getEtapaText = (etapa: string) => {
    switch (etapa) {
      case 'buscando-opciones':
        return 'Buscando opciones'
      case 'empezar-pronto':
        return 'Empezar pronto'
      case 'listo-primer-pedido':
        return 'Listo para pedido'
      case 'busco-mejor-proveedor':
        return 'Busca mejor proveedor'
      default:
        return etapa
    }
  }

  const getCantidadText = (cantidad?: string) => {
    switch (cantidad) {
      case 'menos-24':
        return 'Menos de 24 docenas'
      case '24-100':
        return '24-100 docenas'
      case 'mas-100':
        return 'Más de 100 docenas'
      default:
        return 'No especificado'
    }
  }

  const formatHours = (hours: number | null) => {
    if (hours === null) return 'Sin datos'
    if (hours < 1) return `${Math.round(hours * 60)} min`
    return `${hours.toFixed(1)} h`
  }

  const maxLeadsPerDay = Math.max(...(dashboard?.leadsByDay.map((item) => item.count) ?? [1]))

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Cargando formularios...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Panel de Administración - Formularios de Contacto
          </h1>
          <div className="flex gap-2">
            <Button onClick={fetchAll} className="bg-[#E65C37] hover:bg-[#E65C37]/90">
              Actualizar
            </Button>
            <Button onClick={handleLogout} variant="outline">
              Salir
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-600">
            Total de formularios: <span className="font-semibold">{forms.length}</span>
          </p>
        </div>

        {dashboard ? (
          <div className="grid gap-6 mb-8">
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-600">Leads creados hoy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{dashboard.summary.leadsToday}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-600">Promedio diario (7 días)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{dashboard.summary.avgDailyLast7Days.toFixed(1)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-600">Leads CRM totales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{dashboard.summary.totalLeads}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Leads creados por día (últimos 30 días)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="grid gap-1 items-end h-28"
                  style={{ gridTemplateColumns: `repeat(${dashboard.leadsByDay.length}, minmax(0, 1fr))` }}
                >
                  {dashboard.leadsByDay.map((item) => (
                    <div key={item.date} className="group relative flex flex-col items-center justify-end h-full">
                      <div
                        className="w-full rounded-t bg-[#E65C37]/80 hover:bg-[#E65C37] transition-colors"
                        style={{
                          height: `${Math.max(6, (item.count / maxLeadsPerDay) * 100)}%`,
                        }}
                      />
                      <span className="absolute -top-6 text-[10px] px-1 py-0.5 rounded bg-gray-900 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Comparativa por vendedor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboard.sellersMetrics.length === 0 ? (
                  <p className="text-sm text-gray-500">No hay vendedores para comparar.</p>
                ) : (
                  dashboard.sellersMetrics.map((seller) => (
                    <div key={seller.sellerId} className="rounded-lg border p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{seller.sellerName}</p>
                          <p className="text-xs text-gray-500">{seller.sellerEmail}</p>
                        </div>
                        <Badge variant="outline">Leads: {seller.totalLeads}</Badge>
                      </div>

                      <div className="grid md:grid-cols-3 gap-3 text-sm">
                        <div className="rounded-md bg-green-50 text-green-800 p-3">
                          <p className="flex items-center gap-1 font-medium">
                            <TrendingUp className="h-4 w-4" />
                            Tasa de conversión
                          </p>
                          <p className="text-xl font-bold">{seller.conversionRate.toFixed(1)}%</p>
                          <p className="text-xs">Ganados: {seller.ganados}</p>
                        </div>
                        <div className="rounded-md bg-red-50 text-red-800 p-3">
                          <p className="flex items-center gap-1 font-medium">
                            <TrendingDown className="h-4 w-4" />
                            Tasa de perdido
                          </p>
                          <p className="text-xl font-bold">{seller.lostRate.toFixed(1)}%</p>
                          <p className="text-xs">Perdidos: {seller.perdidos}</p>
                        </div>
                        <div className="rounded-md bg-blue-50 text-blue-800 p-3">
                          <p className="flex items-center gap-1 font-medium">
                            <Clock3 className="h-4 w-4" />
                            Tiempo a primer llamado
                          </p>
                          <p className="text-xl font-bold">{formatHours(seller.averageHoursToFirstTouch)}</p>
                        </div>
                      </div>

                      <div className="text-sm">
                        <p className="font-medium text-gray-700 mb-1">Motivos de pérdida</p>
                        <div className="grid md:grid-cols-5 gap-2 text-xs">
                          <div className="rounded bg-gray-50 p-2">Precio: {seller.lostReasonPercentages.precio.toFixed(1)}%</div>
                          <div className="rounded bg-gray-50 p-2">Minorista: {seller.lostReasonPercentages.minorista.toFixed(1)}%</div>
                          <div className="rounded bg-gray-50 p-2">En otro momento: {seller.lostReasonPercentages['en-otro-momento'].toFixed(1)}%</div>
                          <div className="rounded bg-gray-50 p-2">Pago anticipado: {seller.lostReasonPercentages['pago-anticipado'].toFixed(1)}%</div>
                          <div className="rounded bg-gray-50 p-2">Sin motivo: {seller.lostReasonPercentages['sin-motivo'].toFixed(1)}%</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <p className="text-xs text-gray-500">{dashboard.notes.firstTouchTime}</p>
              </CardContent>
            </Card>
          </div>
        ) : null}

        <div className="grid gap-6">
          {forms.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No hay formularios enviados aún.</p>
              </CardContent>
            </Card>
          ) : (
            forms.map((form) => (
              <Card key={form.id} className="shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl text-[#E65C37]">
                      {form.nombre} - {form.negocio}
                    </CardTitle>
                    <Badge className={getEtapaColor(form.etapa)}>
                      {getEtapaText(form.etapa)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    Enviado el {formatDate(form.createdAt)}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-700">Ubicación</h4>
                      <p className="text-gray-600">{form.provincia}, {form.localidad}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700">Cantidad estimada</h4>
                      <p className="text-gray-600">{getCantidadText(form.cantidad)}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-700">WhatsApp</h4>
                      <p className="text-gray-600">
                        <a 
                          href={`https://wa.me/${form.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#E65C37] hover:underline"
                        >
                          {form.whatsapp}
                        </a>
                      </p>
                    </div>
                    {form.email && (
                      <div>
                        <h4 className="font-semibold text-gray-700">Email</h4>
                        <p className="text-gray-600">
                          <a 
                            href={`mailto:${form.email}`}
                            className="text-[#E65C37] hover:underline"
                          >
                            {form.email}
                          </a>
                        </p>
                      </div>
                    )}
                  </div>

                  {form.comentarios && (
                    <div>
                      <h4 className="font-semibold text-gray-700">Comentarios</h4>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {form.comentarios}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
} 