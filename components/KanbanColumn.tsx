'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { LeadCard } from './LeadCard'
import { Badge } from '@/components/ui/badge'
import { Lead } from '@/types/lead'
import { LucideIcon, Inbox } from 'lucide-react'
import { CrmSeller } from '@/types/auth'

interface KanbanColumnProps {
  id: string
  title: string
  leads: Lead[]
  color: string
  icon: LucideIcon
  onCall?: (lead: Lead) => void
  onWhatsApp?: (lead: Lead) => void
  onEmail?: (lead: Lead) => void
  isAdmin?: boolean
  sellers?: CrmSeller[]
  onAssignSeller?: (leadId: string, sellerId: string | null) => Promise<void>
  onDeleteLead?: (leadId: string) => Promise<void>
  onUpdateLead?: (
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
  ) => Promise<void>
}

export function KanbanColumn({
  id,
  title,
  leads,
  color,
  icon,
  onCall,
  onWhatsApp,
  onEmail,
  isAdmin = false,
  sellers = [],
  onAssignSeller,
  onDeleteLead,
  onUpdateLead,
}: KanbanColumnProps) {
  const Icon = icon
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  })

  const totalValue = leads.reduce((sum, lead) => sum + (lead.valor || 0), 0)

  return (
    <div className="flex flex-col h-full min-h-0 rounded-[1.5rem] border border-white/5 bg-[#0b1328]/40 backdrop-blur-sm overflow-hidden shadow-2xl">
      {/* Header de la columna */}
      <div className="p-4 text-white border-b border-white/5 bg-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`w-2 h-2 rounded-full ring-4 ring-white/5 ${color}`} />
            <h3 className="font-bold text-[11px] tracking-[0.1em] text-slate-100 uppercase font-outfit">{title}</h3>
          </div>
          <Badge variant="secondary" className="bg-white/5 text-slate-400 border border-white/10 text-[9px] font-black rounded-lg px-2">
            {leads.length}
          </Badge>
        </div>
        {totalValue > 0 && (
          <div className="mt-1.5 text-[10px] font-bold text-brand-orange uppercase tracking-widest opacity-80">
            ${totalValue.toLocaleString()}
          </div>
        )}
      </div>

      {/* Área de drop */}
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-0 p-3 overflow-y-auto crm-scrollbar transition-colors duration-100 ${isOver ? 'bg-indigo-500/8' : 'bg-[#0b1328]/50'}`}
      >
        <SortableContext items={leads.map(lead => lead.id)} strategy={verticalListSortingStrategy}>
          {leads.length === 0 ? (
            <div className="text-center text-slate-500 mt-8 border border-dashed border-white/10 rounded-lg py-6">
              <Inbox className="h-8 w-8 mx-auto mb-2 opacity-60" aria-hidden="true" />
              <p className="text-xs">Arrastrá leads acá</p>
            </div>
          ) : (
            leads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onCall={onCall}
                onWhatsApp={onWhatsApp}
                onEmail={onEmail}
                isAdmin={isAdmin}
                sellers={sellers}
                onAssignSeller={onAssignSeller}
                onDeleteLead={onDeleteLead}
                onUpdateLead={onUpdateLead}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  )
} 