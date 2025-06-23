'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { LeadCard } from './LeadCard'
import { Badge } from '@/components/ui/badge'

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

interface KanbanColumnProps {
  id: string
  title: string
  leads: Lead[]
  color: string
  icon: string
  onCall?: (lead: Lead) => void
  onWhatsApp?: (lead: Lead) => void
  onEmail?: (lead: Lead) => void
}

export function KanbanColumn({ 
  id, 
  title, 
  leads, 
  color, 
  icon,
  onCall,
  onWhatsApp,
  onEmail
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  })

  const totalValue = leads.reduce((sum, lead) => sum + (lead.valor || 0), 0)

  return (
    <div className="flex flex-col h-full">
      {/* Header de la columna */}
      <div className={`${color} rounded-t-lg p-4 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{icon}</span>
            <h3 className="font-semibold text-sm">{title}</h3>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white">
            {leads.length}
          </Badge>
        </div>
        {totalValue > 0 && (
          <div className="mt-2 text-xs opacity-90">
            Valor total: ${totalValue.toLocaleString()}
          </div>
        )}
      </div>

      {/* Área de drop */}
      <div
        ref={setNodeRef}
        className={`flex-1 p-4 bg-gray-50 min-h-[500px] transition-colors ${
          isOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed' : ''
        }`}
      >
        <SortableContext items={leads.map(lead => lead.id)} strategy={verticalListSortingStrategy}>
          {leads.length === 0 ? (
            <div className="text-center text-gray-400 mt-8">
              <div className="text-4xl mb-2">📭</div>
              <p className="text-sm">No hay leads en esta etapa</p>
            </div>
          ) : (
            leads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onCall={onCall}
                onWhatsApp={onWhatsApp}
                onEmail={onEmail}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  )
} 