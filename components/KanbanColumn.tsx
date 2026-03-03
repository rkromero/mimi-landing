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
    <div className="flex flex-col h-full min-h-0 rounded-xl border border-slate-800/80 bg-[#0b1328] overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.24)]">
      {/* Header de la columna */}
      <div className="p-3 text-white border-b border-slate-800/80 bg-[#0a1020]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${color}`} />
            <Icon className="h-3.5 w-3.5 text-slate-300" aria-hidden="true" />
            <h3 className="font-medium text-xs tracking-wide text-slate-200">{title}</h3>
          </div>
          <Badge variant="secondary" className="bg-slate-700/30 text-slate-200 border border-slate-700/60 text-[10px]">
            {leads.length}
          </Badge>
        </div>
        {totalValue > 0 && (
          <div className="mt-1 text-[11px] text-slate-400">
            ${totalValue.toLocaleString()}
          </div>
        )}
      </div>

      {/* Área de drop */}
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-0 p-3 overflow-y-auto crm-scrollbar transition-colors ${
          isOver ? 'bg-indigo-500/10' : 'bg-[#0b1328]'
        }`}
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