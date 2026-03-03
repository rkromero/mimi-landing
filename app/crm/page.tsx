'use client'

import { useState, useEffect } from 'react'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from '@dnd-kit/core'
import { KanbanColumn } from '@/components/KanbanColumn'
import { LeadCard } from '@/components/LeadCard'
import { MobileCRM } from '@/components/MobileCRM'
import { useMobile } from '@/hooks/use-mobile'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import {
  RefreshCw,
  BarChart3,
  Users,
  TrendingUp,
  Inbox,
  PhoneCall,
  RefreshCcw,
  CircleCheck,
  CircleX,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lead, LeadsPorEtapa } from '@/types/lead'
import { CreateLeadModal } from '@/components/CreateLeadModal'
import { LucideIcon } from 'lucide-react'

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

export default function CRMPage() {
  const isMobile = useMobile()
  const [leads, setLeads] = useState<LeadsPorEtapa>({
    entrante: [],
    'primer-llamado': [],
    seguimiento: [],
    ganado: [],
    perdido: []
  })
  const [activeId, setActiveId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Cargar leads
  const cargarLeads = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/crm')
      if (response.ok) {
        const data = await response.json()
        setLeads(data)
      }
    } catch (error) {
      console.error('Error al cargar leads:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarLeads()
  }, [])

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
      cargarLeads()
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
  const totalLeads = Object.values(leads).reduce((sum, columnLeads) => sum + columnLeads.length, 0)
  const totalValue = Object.values(leads).flat().reduce((sum, lead) => sum + (lead.valor || 0), 0)
  const conversionRate = totalLeads > 0 ? ((leads.ganado.length / totalLeads) * 100).toFixed(1) : '0'

  // Renderizado condicional: móvil vs desktop
  if (isMobile) {
    return (
      <MobileCRM
        leads={leads}
        onCall={handleCall}
        onWhatsApp={handleWhatsApp}
        onEmail={handleEmail}
        onRefresh={cargarLeads}
        loading={loading}
      />
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Cargando CRM...</p>
        </div>
      </div>
    )
  }

  // Vista desktop (sin cambios)
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">CRM MIMI</h1>
              <p className="text-gray-600">Gestión de Leads y Oportunidades</p>
            </div>
            <div className="flex items-center space-x-3">
              <CreateLeadModal onLeadCreated={cargarLeads} />
              <Button onClick={cargarLeads} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLeads}</div>
              <p className="text-xs text-muted-foreground">leads activos</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">valor estimado</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversión</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversionRate}%</div>
              <p className="text-xs text-muted-foreground">tasa de conversión</p>
            </CardContent>
          </Card>
        </div>

        {/* Kanban Board */}
        <DndContext
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 h-[calc(100vh-280px)]">
            {COLUMNAS.map((columna) => (
              <div key={columna.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <KanbanColumn
                  id={columna.id}
                  title={columna.title}
                  leads={leads[columna.id as keyof LeadsPorEtapa]}
                  color={columna.color}
                  icon={columna.icon}
                  onCall={handleCall}
                  onWhatsApp={handleWhatsApp}
                  onEmail={handleEmail}
                />
              </div>
            ))}
          </div>

          <DragOverlay>
            {activeId ? (
              <div className="opacity-90 rotate-3 scale-105">
                <LeadCard lead={getActiveLead()!} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
} 