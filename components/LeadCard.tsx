'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Phone, MessageCircle, Mail, MapPin, Package, Calendar, DollarSign, User, Building, Clock, MessageSquare, FileText, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { Lead } from '@/types/lead'
import { CrmSeller } from '@/types/auth'

interface LeadCardProps {
  lead: Lead
  onCall?: (lead: Lead) => void
  onWhatsApp?: (lead: Lead) => void
  onEmail?: (lead: Lead) => void
  isAdmin?: boolean
  sellers?: CrmSeller[]
  onAssignSeller?: (leadId: string, sellerId: string | null) => Promise<void>
}

const UNASSIGNED_OPTION = '__UNASSIGNED__'

export function LeadCard({
  lead,
  onCall,
  onWhatsApp,
  onEmail,
  isAdmin = false,
  sellers = [],
  onAssignSeller,
}: LeadCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [assigningSeller, setAssigningSeller] = useState(false)
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
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

  const getCantidadText = (cantidad?: string) => {
    switch (cantidad) {
      case 'menos-24':
        return '< 24 doc'
      case '24-100':
        return '24-100 doc'
      case 'mas-100':
        return '> 100 doc'
      default:
        return 'No especificado'
    }
  }

  const getCantidadTextFull = (cantidad?: string) => {
    switch (cantidad) {
      case 'menos-24':
        return 'Menos de 24 docenas'
      case '24-100':
        return 'Entre 24 y 100 docenas'
      case 'mas-100':
        return 'Más de 100 docenas'
      default:
        return 'No especificado'
    }
  }

  const getEtapaText = (etapa: string) => {
    switch (etapa) {
      case 'listo-primer-pedido':
        return 'Listo para primer pedido'
      case 'empezar-pronto':
        return 'Empezar pronto'
      case 'busco-mejor-proveedor':
        return 'Busca mejor proveedor'
      case 'buscando-opciones':
        return 'Explorando opciones'
      default:
        return etapa
    }
  }

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowDetails(true)
  }

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        className={`mb-2 border-white/10 bg-[#10182b] text-slate-100 hover:border-indigo-500/40 hover:bg-[#121d33] transition-colors duration-200 ${
          isDragging ? 'shadow-lg ring-1 ring-indigo-500/50' : ''
        }`}
      >
        {/* Área de drag and drop */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1"
        >
          <div className="w-full h-1 bg-white/10 rounded-full mb-2"></div>
        </div>
        <CardContent className="p-3">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-slate-100 truncate">{lead.nombre}</h3>
              <p className="text-xs text-slate-400 truncate">{lead.negocio}</p>
            </div>
            <div className="text-[11px] text-slate-300 bg-white/10 px-2 py-0.5 rounded">
              {lead.valor ? `$${lead.valor.toLocaleString()}` : 'Sin valor'}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{lead.provincia}, {lead.localidad}</span>
          </div>

          <Badge variant="secondary" className={`text-xs mb-3 ${getEtapaColor(lead.etapa)}`}>
            {lead.etapa === 'listo-primer-pedido' && 'Listo'}
            {lead.etapa === 'empezar-pronto' && 'Pronto'}
            {lead.etapa === 'busco-mejor-proveedor' && 'Busca'}
            {lead.etapa === 'buscando-opciones' && 'Explora'}
          </Badge>

          <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(lead.createdAt)}</span>
          </div>

          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs h-8 px-2 border-white/10 bg-white/5 text-indigo-300 hover:text-indigo-100 hover:bg-indigo-500/20 hover:border-indigo-300/40 transition-colors"
            onClick={handleDetailsClick}
          >
            Ver lead
            <ArrowRight className="h-3 w-3 ml-1" aria-hidden="true" />
          </Button>
        </CardContent>
      </Card>

      <Sheet open={showDetails} onOpenChange={setShowDetails}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-2xl max-h-screen overflow-y-auto border-white/10 bg-[#0b1020] text-slate-100"
        >
          <SheetHeader className="pb-4 border-b border-white/10">
            <SheetTitle className="flex items-center gap-3 text-xl text-slate-100">
              <div className="w-10 h-10 bg-gradient-to-r from-[#E65C37] to-orange-500 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-slate-100">{lead.nombre}</div>
                <div className="text-sm text-slate-400 font-normal">{lead.negocio}</div>
              </div>
            </SheetTitle>
          </SheetHeader>
          
          <div className="space-y-6 py-4">
            {isAdmin && onAssignSeller ? (
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <div className="space-y-2">
                  <Label className="text-slate-300">Vendedor asignado</Label>
                  <Select
                    value={lead.assignedToId ?? UNASSIGNED_OPTION}
                    onValueChange={async (value) => {
                      const nextSellerId = value === UNASSIGNED_OPTION ? null : value
                      try {
                        setAssigningSeller(true)
                        await onAssignSeller(lead.id, nextSellerId)
                      } finally {
                        setAssigningSeller(false)
                      }
                    }}
                    disabled={assigningSeller}
                  >
                    <SelectTrigger className="bg-[#10182b] border-white/10 text-slate-100">
                      <SelectValue placeholder="Seleccionar vendedor" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#10182b] border-white/10 text-slate-100">
                      <SelectItem value={UNASSIGNED_OPTION}>Sin asignar</SelectItem>
                      {sellers.map((seller) => (
                        <SelectItem key={seller.id} value={seller.id}>
                          {seller.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : null}

            <div className="bg-gradient-to-r from-[#E65C37] to-orange-500 text-white rounded-xl p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm opacity-90">Ubicación</div>
                      <div className="font-semibold">{lead.provincia}, {lead.localidad}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Package className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm opacity-90">Volumen estimado</div>
                      <div className="font-semibold">{getCantidadTextFull(lead.cantidad)}</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm opacity-90">Etapa de compra</div>
                      <div className="font-semibold">{getEtapaText(lead.etapa)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm opacity-90">Fecha de registro</div>
                      <div className="font-semibold">{formatDate(lead.createdAt)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Phone className="h-3 w-3 text-blue-300" />
                </div>
                Información de contacto
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-400/20">
                    <MessageCircle className="h-5 w-5 text-green-300" />
                    <div>
                      <div className="text-sm text-slate-400">WhatsApp</div>
                      <div className="font-medium text-slate-100">{lead.whatsapp}</div>
                    </div>
                  </div>
                  {lead.email && (
                    <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-400/20">
                      <Mail className="h-5 w-5 text-blue-300" />
                      <div>
                        <div className="text-sm text-slate-400">Email</div>
                        <div className="font-medium text-slate-100">{lead.email}</div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                    <Building className="h-5 w-5 text-slate-400" />
                    <div>
                      <div className="text-sm text-slate-400">Negocio</div>
                      <div className="font-medium text-slate-100">{lead.negocio}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                    <MapPin className="h-5 w-5 text-slate-400" />
                    <div>
                      <div className="text-sm text-slate-400">Ubicación</div>
                      <div className="font-medium text-slate-100">{lead.provincia}, {lead.localidad}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {lead.comentarios && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <MessageSquare className="h-3 w-3 text-orange-300" />
                  </div>
                  Comentarios del cliente
                </h3>
                <div className="bg-orange-500/10 border-l-4 border-orange-400 p-4 rounded-lg">
                  <p className="text-slate-100 italic leading-relaxed">"{lead.comentarios}"</p>
                </div>
              </div>
            )}

            {lead.notas && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <MessageSquare className="h-3 w-3 text-purple-300" />
                  </div>
                  Notas del equipo
                </h3>
                <div className="bg-purple-500/10 border-l-4 border-purple-400 p-4 rounded-lg">
                  <p className="text-slate-100 leading-relaxed">{lead.notas}</p>
                </div>
              </div>
            )}

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-slate-100 mb-4">Acciones rápidas</h3>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => onCall?.(lead)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Llamar ahora
                </Button>
                <Button
                  onClick={() => onWhatsApp?.(lead)}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
                {lead.email && (
                  <Button
                    onClick={() => onEmail?.(lead)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Enviar email
                  </Button>
                )}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
} 