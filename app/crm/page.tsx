'use client'

import { useState, useEffect } from 'react'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { KanbanColumn } from '@/components/KanbanColumn'
import { LeadCard } from '@/components/LeadCard'
import { Button } from '@/components/ui/button'
import { RefreshCw, BarChart3, Users, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Lead {
  id: string
  nombre: string
  negocio: string
  ubicacion: string
  cantidad?: string
  etapa: string
  etapaCrm: string
  whatsapp: string
  email?: string
  comentarios?: string
  notas?: string
  valor?: number
  createdAt: string
  updatedAt: string
}

interface LeadsPorEtapa {
  entrante: Lead[]
  'primer-llamado': Lead[]
  seguimiento: Lead[]
  ganado: Lead[]
  perdido: Lead[]
}

const COLUMNAS = [
  {
    id: 'entrante',
    title: 'LEADS ENTRANTES',
    color: 'bg-blue-600',
    icon: '📨'
  },
  {
    id: 'primer-llamado',
    title: 'PRIMER LLAMADO REALIZADO',
    color: 'bg-yellow-600',
    icon: '📞'
  },
  {
    id: 'seguimiento',
    title: 'HACER SEGUIMIENTO',
    color: 'bg-purple-600',
    icon: '🔄'
  },
  {
    id: 'ganado',
    title: 'LEAD GANADO',
    color: 'bg-green-600',
    icon: '🎉'
  },
  {
    id: 'perdido',
    title: 'LEAD PERDIDO',
    color: 'bg-red-600',
    icon: '❌'
  }
]

export default function CRMPage() {
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
    } catch (error) {
      console.error('Error al actualizar lead:', error)
      // Revertir cambios si falla
      cargarLeads()
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
    console.log('🚀 handleCall ejecutándose para:', lead.nombre)
    console.log('🚀 Número original:', lead.whatsapp)
    
    try {
      const phoneNumber = lead.whatsapp.replace(/\D/g, '')
      console.log('🚀 Número limpio:', phoneNumber)
      
      if (phoneNumber) {
        // Agregar código de país si no lo tiene
        const fullNumber = phoneNumber.startsWith('54') ? phoneNumber : `54${phoneNumber}`
        console.log('🚀 Número final:', fullNumber)
        console.log('🚀 Intentando abrir tel:', `tel:+${fullNumber}`)
        
        // Intentar múltiples métodos
        const telUrl = `tel:+${fullNumber}`
        
        // Método 1: window.open
        const result = window.open(telUrl)
        console.log('🚀 Resultado window.open:', result)
        
        // Método 2: crear link y clickear (fallback)
        if (!result) {
          console.log('🚀 Probando método alternativo...')
          const link = document.createElement('a')
          link.href = telUrl
          link.click()
        }
        
        console.log(`📞 Llamando a ${lead.nombre}: +${fullNumber}`)
        alert(`Intentando llamar a ${lead.nombre} al +${fullNumber}`)
      } else {
        console.error('❌ Número de teléfono vacío')
        alert('Número de teléfono no válido')
      }
    } catch (error) {
      console.error('❌ Error al realizar llamada:', error)
      alert('Error al realizar la llamada: ' + (error instanceof Error ? error.message : String(error)))
    }
  }

  const handleWhatsApp = (lead: Lead) => {
    try {
      const phoneNumber = lead.whatsapp.replace(/\D/g, '')
      if (phoneNumber) {
        // Agregar código de país si no lo tiene
        const fullNumber = phoneNumber.startsWith('54') ? phoneNumber : `54${phoneNumber}`
        const message = `Hola ${lead.nombre}! Te contacto desde MIMI Alfajores respecto a tu consulta sobre distribución. ¿Cuándo podemos hablar?`
        const encodedMessage = encodeURIComponent(message)
        window.open(`https://wa.me/${fullNumber}?text=${encodedMessage}`, '_blank')
        console.log(`💬 WhatsApp a ${lead.nombre}: +${fullNumber}`)
      } else {
        alert('Número de WhatsApp no válido')
      }
    } catch (error) {
      console.error('Error al abrir WhatsApp:', error)
      alert('Error al abrir WhatsApp')
    }
  }

  const handleEmail = (lead: Lead) => {
    try {
      if (lead.email) {
        const subject = encodeURIComponent(`MIMI Alfajores - Consulta de ${lead.nombre}`)
        const body = encodeURIComponent(`Hola ${lead.nombre},

Te contacto desde MIMI Alfajores respecto a tu consulta sobre distribución.

Información de tu consulta:
- Negocio: ${lead.negocio}
- Ubicación: ${lead.ubicacion}
- Cantidad estimada: ${lead.cantidad || 'No especificada'}
- Etapa: ${lead.etapa}

¿Cuándo podemos coordinar una llamada para conversar sobre la oportunidad?

Saludos,
Equipo MIMI`)
        
        window.open(`mailto:${lead.email}?subject=${subject}&body=${body}`)
        console.log(`📧 Email a ${lead.nombre}: ${lead.email}`)
      } else {
        alert('Email no disponible para este lead')
      }
    } catch (error) {
      console.error('Error al abrir email:', error)
      alert('Error al abrir el cliente de email')
    }
  }

  // Calcular estadísticas
  const totalLeads = Object.values(leads).reduce((sum, columnLeads) => sum + columnLeads.length, 0)
  const totalValue = Object.values(leads).flat().reduce((sum, lead) => sum + (lead.valor || 0), 0)
  const conversionRate = totalLeads > 0 ? ((leads.ganado.length / totalLeads) * 100).toFixed(1) : '0'

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
            <Button onClick={cargarLeads} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
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