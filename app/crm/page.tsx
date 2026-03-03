'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from '@dnd-kit/core'
import { KanbanColumn } from '@/components/KanbanColumn'
import { LeadCard } from '@/components/LeadCard'
import { MobileCRM } from '@/components/MobileCRM'
import { useMobile } from '@/hooks/use-mobile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import {
  Search,
  RefreshCw,
  BarChart3,
  Users,
  TrendingUp,
  LogOut,
  ShieldCheck,
  KanbanSquare,
  Inbox,
  PhoneCall,
  RefreshCcw,
  CircleCheck,
  CircleX,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lead, LeadsPorEtapa } from '@/types/lead'
import { CreateLeadModal } from '@/components/CreateLeadModal'
import { CreateSellerModal } from '@/components/CreateSellerModal'
import { LucideIcon } from 'lucide-react'
import { CrmAuthUser, CrmSeller } from '@/types/auth'

type CrmEtapaId = keyof LeadsPorEtapa

const COLUMNAS = [
  {
    id: 'entrante',
    title: 'LEADS ENTRANTES',
    color: 'bg-blue-600',
    icon: Inbox,
  },
  {
    id: 'primer-llamado',
    title: 'PRIMER LLAMADO REALIZADO',
    color: 'bg-yellow-600',
    icon: PhoneCall,
  },
  {
    id: 'seguimiento',
    title: 'HACER SEGUIMIENTO',
    color: 'bg-purple-600',
    icon: RefreshCcw,
  },
  {
    id: 'ganado',
    title: 'LEAD GANADO',
    color: 'bg-green-600',
    icon: CircleCheck,
  },
  {
    id: 'perdido',
    title: 'LEAD PERDIDO',
    color: 'bg-red-600',
    icon: CircleX,
  }
] as const satisfies ReadonlyArray<{
  id: CrmEtapaId
  title: string
  color: string
  icon: LucideIcon
}>

const normalizePhone = (phone: string) => {
  const cleaned = phone.replace(/\D/g, '')
  if (!cleaned) return null
  return cleaned.startsWith('54') ? cleaned : `54${cleaned}`
}

const UNASSIGNED_OPTION = '__UNASSIGNED__'

const emptyLeads = (): LeadsPorEtapa => ({
  entrante: [],
  'primer-llamado': [],
  seguimiento: [],
  ganado: [],
  perdido: [],
})

const filterLeadsBySeller = (leads: LeadsPorEtapa, sellerFilter: string): LeadsPorEtapa => {
  if (sellerFilter === 'all') return leads

  const isUnassigned = sellerFilter === UNASSIGNED_OPTION
  const filterColumn = (columnLeads: Lead[]) =>
    columnLeads.filter((lead) =>
      isUnassigned ? !lead.assignedToId : lead.assignedToId === sellerFilter
    )

  return {
    entrante: filterColumn(leads.entrante),
    'primer-llamado': filterColumn(leads['primer-llamado']),
    seguimiento: filterColumn(leads.seguimiento),
    ganado: filterColumn(leads.ganado),
    perdido: filterColumn(leads.perdido),
  }
}

export default function CRMPage() {
  const router = useRouter()
  const isMobile = useMobile()
  const [currentUser, setCurrentUser] = useState<CrmAuthUser | null>(null)
  const [sellers, setSellers] = useState<CrmSeller[]>([])
  const [sellerFilter, setSellerFilter] = useState('all')
  const [leads, setLeads] = useState<LeadsPorEtapa>(emptyLeads())
  const [activeId, setActiveId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const isAdmin = currentUser?.role === 'ADMIN'
  const visibleLeads = useMemo(
    () => (isAdmin ? filterLeadsBySeller(leads, sellerFilter) : leads),
    [isAdmin, leads, sellerFilter]
  )

  const cargarLeads = async () => {
    const response = await fetch('/api/crm')
    if (!response.ok) {
      throw new Error('No se pudo cargar el CRM')
    }
    const data = await response.json()
    setLeads(data)
  }

  const cargarVendedores = async () => {
    const response = await fetch('/api/users')
    if (!response.ok) {
      throw new Error('No se pudo cargar vendedores')
    }
    const data = await response.json()
    setSellers(data.users || [])
  }

  useEffect(() => {
    const bootstrap = async () => {
      try {
        setLoading(true)
        const meResponse = await fetch('/api/auth/me')
        if (!meResponse.ok) {
          router.replace('/crm/login')
          return
        }

        const meData = await meResponse.json()
        const user = meData.user as CrmAuthUser
        setCurrentUser(user)

        const requests: Promise<unknown>[] = [cargarLeads()]
        if (user.role === 'ADMIN') {
          requests.push(cargarVendedores())
        }
        await Promise.all(requests)
      } catch (error) {
        console.error('Error inicializando CRM:', error)
        toast({
          title: 'No se pudo cargar CRM',
          description: 'Intenta nuevamente en unos segundos.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    void bootstrap()
  }, [router])

  const refreshData = async () => {
    try {
      setLoading(true)
      const requests: Promise<unknown>[] = [cargarLeads()]
      if (isAdmin) {
        requests.push(cargarVendedores())
      }
      await Promise.all(requests)
    } catch (error) {
      console.error('Error refrescando CRM:', error)
      toast({
        title: 'No se pudo actualizar',
        description: 'Revisa tu conexion e intenta otra vez.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      router.replace('/crm/login')
      router.refresh()
    }
  }

  const handleSellerCreated = async () => {
    if (!isAdmin) return
    await refreshData()
  }

  const handleAssignSeller = async (leadId: string, sellerId: string | null) => {
    const response = await fetch('/api/crm', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        leadId,
        assignedToId: sellerId,
      }),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data.error || 'No se pudo asignar vendedor')
    }

    await cargarLeads()
  }

  const handleUpdateLead = async (
    leadId: string,
    payload: {
      nuevaEtapa?: string
      motivoPerdido?: string
      nombre?: string
      negocio?: string
      provincia?: string
      localidad?: string
      whatsapp?: string
      email?: string
      comentarios?: string
      cantidad?: string
      etapa?: string
    }
  ) => {
    const response = await fetch('/api/crm', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        leadId,
        ...payload,
      }),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data.error || 'No se pudo actualizar el lead')
    }

    await cargarLeads()
  }

  const handleDeleteLead = async (leadId: string) => {
    const response = await fetch('/api/crm', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId }),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data.error || 'No se pudo eliminar el lead')
    }

    await cargarLeads()
  }

  // Manejar inicio de drag
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  // Manejar fin de drag
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      setActiveId(null)
      return
    }

    const activeId = active.id as string
    const overId = over.id as string

    // Encontrar el lead que se está moviendo
    let leadToMove: Lead | null = null
    let fromColumn = ''

    for (const [columnId, columnLeads] of Object.entries(leads)) {
      const lead = columnLeads.find((l: Lead) => l.id === activeId)
      if (lead) {
        leadToMove = lead
        fromColumn = columnId
        break
      }
    }

    if (!leadToMove) {
      setActiveId(null)
      return
    }

    // Determinar la columna de destino
    let toColumn = overId
    if (!COLUMNAS.find(col => col.id === overId)) {
      // Si se soltó sobre otro lead, encontrar su columna
      for (const [columnId, columnLeads] of Object.entries(leads)) {
        if (columnLeads.find((l: Lead) => l.id === overId)) {
          toColumn = columnId
          break
        }
      }
    }

    if (fromColumn === toColumn) {
      setActiveId(null)
      return
    }

    if (toColumn === 'perdido') {
      setActiveId(null)
      toast({
        title: 'Motivo obligatorio para perdido',
        description: 'Para mover a perdido, abrí el lead y elegí el motivo en el panel derecho.',
        variant: 'destructive',
      })
      return
    }

    // Actualizar estado local inmediatamente
    setLeads(prev => {
      const newLeads = { ...prev }

      // Remover de la columna origen
      newLeads[fromColumn as keyof LeadsPorEtapa] = newLeads[fromColumn as keyof LeadsPorEtapa].filter(
        l => l.id !== activeId
      )

      // Agregar a la columna destino
      const updatedLead = { ...leadToMove!, etapaCrm: toColumn }
      newLeads[toColumn as keyof LeadsPorEtapa] = [
        ...newLeads[toColumn as keyof LeadsPorEtapa],
        updatedLead
      ]

      return newLeads
    })

    // Actualizar en el servidor
    try {
      await fetch('/api/crm', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadId: activeId,
          nuevaEtapa: toColumn,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('No se pudo actualizar la etapa del lead')
          }
        })
    } catch (error) {
      console.error('Error al actualizar lead:', error)
      // Revertir cambios si falla
      await cargarLeads()
      toast({
        title: 'No se pudo mover el lead',
        description: 'Hubo un error al guardar el cambio de etapa.',
        variant: 'destructive',
      })
    }

    setActiveId(null)
  }

  // Obtener el lead activo para el overlay
  const getActiveLead = (): Lead | null => {
    if (!activeId) return null

    for (const columnLeads of Object.values(leads)) {
      const lead = columnLeads.find((l: Lead) => l.id === activeId)
      if (lead) return lead
    }
    return null
  }

  // Manejar acciones de contacto
  const handleCall = (lead: Lead) => {
    const fullNumber = normalizePhone(lead.whatsapp)
    if (!fullNumber) {
      toast({
        title: 'Numero invalido',
        description: 'El lead no tiene un numero de telefono valido.',
        variant: 'destructive',
      })
      return
    }

    window.location.href = `tel:+${fullNumber}`
  }

  const handleWhatsApp = (lead: Lead) => {
    const fullNumber = normalizePhone(lead.whatsapp)
    if (!fullNumber) {
      toast({
        title: 'Numero invalido',
        description: 'El lead no tiene un numero de WhatsApp valido.',
        variant: 'destructive',
      })
      return
    }

    const message = `Hola ${lead.nombre}! Te contacto desde MIMI Alfajores respecto a tu consulta sobre distribucion. Un representante de la empresa se estara contactando con vos en breve!`
    const encodedMessage = encodeURIComponent(message)
    window.open(`https://wa.me/${fullNumber}?text=${encodedMessage}`, '_blank', 'noopener,noreferrer')
  }

  const handleEmail = (lead: Lead) => {
    if (!lead.email) {
      toast({
        title: 'Email no disponible',
        description: 'Este lead no tiene correo registrado.',
        variant: 'destructive',
      })
      return
    }

    const subject = encodeURIComponent(`MIMI Alfajores - Consulta de ${lead.nombre}`)
    const body = encodeURIComponent(`Hola ${lead.nombre},

Te contacto desde MIMI Alfajores respecto a tu consulta sobre distribucion.

Informacion de tu consulta:
- Negocio: ${lead.negocio}
- Provincia: ${lead.provincia}
- Localidad: ${lead.localidad}
- Cantidad estimada: ${lead.cantidad || 'No especificada'}
- Etapa: ${lead.etapa}

Cuando podemos coordinar una llamada para conversar sobre la oportunidad?

Saludos,
Equipo MIMI`)

    window.open(`mailto:${lead.email}?subject=${subject}&body=${body}`)
  }

  // Calcular estadísticas
  const totalLeads = Object.values(visibleLeads).reduce((sum, columnLeads) => sum + columnLeads.length, 0)
  const totalValue = Object.values(visibleLeads).flat().reduce((sum, lead) => sum + (lead.valor || 0), 0)
  const conversionRate = totalLeads > 0 ? ((visibleLeads.ganado.length / totalLeads) * 100).toFixed(1) : '0'

  // Renderizado condicional: móvil vs desktop
  if (isMobile) {
    return (
      <MobileCRM
        leads={visibleLeads}
        onCall={handleCall}
        onWhatsApp={handleWhatsApp}
        onEmail={handleEmail}
        onRefresh={refreshData}
        onLogout={handleLogout}
        onSellerCreated={handleSellerCreated}
        onAssignSeller={handleAssignSeller}
        onUpdateLead={handleUpdateLead}
        currentUserRole={currentUser?.role || 'VENDEDOR'}
        sellers={sellers}
        loading={loading}
      />
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070a13] text-slate-200 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-indigo-400" />
          <p className="text-sm text-slate-400">Cargando CRM...</p>
        </div>
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
          <div className="px-4 py-4 border-b border-white/10">
            <p className="text-xs text-slate-400">Usuario</p>
            <p className="text-sm font-medium text-slate-100 truncate">{currentUser?.email}</p>
          </div>

          <nav className="px-3 py-4 space-y-1">
            <Link
              href="/crm"
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-sm"
            >
              <KanbanSquare className="h-4 w-4" />
              CRM
            </Link>
            {isAdmin ? (
              <Link
                href="/admin"
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-slate-300 hover:bg-white/5 border border-transparent hover:border-white/10 text-sm transition-colors"
              >
                <ShieldCheck className="h-4 w-4" />
                Admin
              </Link>
            ) : null}
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
            <div className="relative w-full max-w-sm">
              <Search className="h-4 w-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                className="pl-9 bg-[#0f1932] border-slate-700/60 text-slate-100 placeholder:text-slate-500 h-9"
                placeholder="Buscar..."
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {isAdmin ? (
                <Select value={sellerFilter} onValueChange={setSellerFilter}>
                  <SelectTrigger className="w-[220px] h-9 bg-[#0b1328] border-slate-700 text-slate-100">
                    <SelectValue placeholder="Filtrar por vendedor" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0b1328] border-slate-700 text-slate-200">
                    <SelectItem value="all">Todos los vendedores</SelectItem>
                    <SelectItem value={UNASSIGNED_OPTION}>Sin asignar</SelectItem>
                    {sellers.map((seller) => (
                      <SelectItem key={seller.id} value={seller.id}>
                        {seller.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null}
              {isAdmin ? (
                <CreateSellerModal
                  onSellerCreated={handleSellerCreated}
                  triggerClassName="h-9 border-slate-600 bg-[#1b2a52] text-slate-100 hover:bg-[#24386d]"
                />
              ) : null}
              <CreateLeadModal
                onLeadCreated={refreshData}
                triggerClassName="h-9 bg-[#0ea56b] hover:bg-[#0b8a59] text-white"
              />
              <Button
                onClick={refreshData}
                variant="outline"
                className="h-9 border-slate-600 bg-[#101a34] text-slate-100 hover:bg-[#162345]"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto px-4 md:px-6 py-6 flex flex-col gap-6 crm-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
              <Card className="bg-[#0b1328]/40 backdrop-blur-md border-white/5 text-slate-100 shadow-xl group hover:border-brand-orange/30 transition-all">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-brand-orange transition-colors">Total Leads</CardTitle>
                  <Users className="h-4 w-4 text-slate-500 group-hover:text-brand-orange transition-colors" />
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="text-3xl font-black italic tracking-tighter text-white">{totalLeads}</div>
                  <p className="text-[10px] text-slate-500 font-medium uppercase mt-1">leads activos en sistema</p>
                </CardContent>
              </Card>

              <Card className="bg-[#0b1328]/40 backdrop-blur-md border-white/5 text-slate-100 shadow-xl group hover:border-brand-teal/30 transition-all">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-brand-teal transition-colors">Valor Total</CardTitle>
                  <BarChart3 className="h-4 w-4 text-slate-500 group-hover:text-brand-teal transition-colors" />
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="text-3xl font-black italic tracking-tighter text-brand-teal">${totalValue.toLocaleString()}</div>
                  <p className="text-[10px] text-slate-500 font-medium uppercase mt-1">valor proyectado de ventas</p>
                </CardContent>
              </Card>

              <Card className="bg-[#0b1328]/40 backdrop-blur-md border-white/5 text-slate-100 shadow-xl group hover:border-brand-orange/30 transition-all">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-brand-orange transition-colors">Conversión</CardTitle>
                  <TrendingUp className="h-4 w-4 text-slate-500 group-hover:text-brand-orange transition-colors" />
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="text-3xl font-black italic tracking-tighter text-white">{conversionRate}%</div>
                  <p className="text-[10px] text-slate-500 font-medium uppercase mt-1">tasa de cierre exitoso</p>
                </CardContent>
              </Card>
            </div>

            <DndContext
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden pb-4 crm-scrollbar">
                <div className="flex gap-4 h-full min-w-max xl:min-w-0 xl:grid xl:grid-cols-5">
                  {COLUMNAS.map((columna) => (
                    <KanbanColumn
                      key={columna.id}
                      id={columna.id}
                      title={columna.title}
                      leads={visibleLeads[columna.id as keyof LeadsPorEtapa]}
                      color={columna.color}
                      icon={columna.icon}
                      onCall={handleCall}
                      onWhatsApp={handleWhatsApp}
                      onEmail={handleEmail}
                      isAdmin={isAdmin}
                      sellers={sellers}
                      onAssignSeller={handleAssignSeller}
                      onDeleteLead={handleDeleteLead}
                      onUpdateLead={handleUpdateLead}
                    />
                  ))}
                </div>
              </div>

              <DragOverlay>
                {activeId ? (
                  <div className="opacity-90 rotate-2 scale-105 transition-transform duration-200">
                    <LeadCard
                      lead={getActiveLead()!}
                      isAdmin={isAdmin}
                      sellers={sellers}
                      onAssignSeller={handleAssignSeller}
                      onDeleteLead={handleDeleteLead}
                      onUpdateLead={handleUpdateLead}
                    />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </main>
      </div>
    </div>
  )
}