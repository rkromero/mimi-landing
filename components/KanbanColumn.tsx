'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { LeadCard } from './LeadCard'
import { Badge } from '@/components/ui/badge'
import { Lead } from '@/types/lead'
import { LucideIcon, Inbox } from 'lucide-react'

interface KanbanColumnProps {
  id: string
  title: string
  leads: Lead[]
  color: string
  icon: LucideIcon
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
  const Icon = icon
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  })

  const totalValue = leads.reduce((sum, lead) => sum + (lead.valor || 0), 0)

  return (
    <div className="flex flex-col h-full">
      {/* Header de la columna */}
      <div className={`${color} rounded-t-lg p-3 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" aria-hidden="true" />
            <h3 className="font-semibold text-xs">{title}</h3>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white text-xs">
            {leads.length}
          </Badge>
        </div>
        {totalValue > 0 && (
          <div className="mt-1 text-xs opacity-90">
            ${totalValue.toLocaleString()}
          </div>
        )}
      </div>

      {/* Área de drop */}
      <div
        ref={setNodeRef}
        className={`flex-1 p-3 bg-gray-50 min-h-[400px] max-h-[600px] overflow-y-auto transition-colors ${
          isOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed' : ''
        }`}
      >
        <SortableContext items={leads.map(lead => lead.id)} strategy={verticalListSortingStrategy}>
          {leads.length === 0 ? (
            <div className="text-center text-gray-400 mt-8">
              <Inbox className="h-10 w-10 mx-auto mb-2" aria-hidden="true" />
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