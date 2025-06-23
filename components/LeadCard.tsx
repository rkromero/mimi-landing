'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Phone, MessageCircle, Mail, MapPin, Package, Calendar, DollarSign, User, Building } from 'lucide-react'

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

interface LeadCardProps {
  lead: Lead
  onCall?: (lead: Lead) => void
  onWhatsApp?: (lead: Lead) => void
  onEmail?: (lead: Lead) => void
}

export function LeadCard({ lead, onCall, onWhatsApp, onEmail }: LeadCardProps) {
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

  const cleanPhoneNumber = (phone: string) => {
    return phone.replace(/\D/g, '')
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`mb-2 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${
        isDragging ? 'shadow-lg' : ''
      }`}
    >
      <CardContent className="p-3">
        {/* Header con nombre y valor */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-gray-900 truncate">{lead.nombre}</h3>
            <p className="text-xs text-gray-600 truncate">{lead.negocio}</p>
          </div>
          {lead.valor && (
            <div className="flex items-center gap-1 text-green-600 ml-2">
              <DollarSign className="h-3 w-3" />
              <span className="text-xs font-medium">
                ${lead.valor.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Info compacta */}
        <div className="space-y-1 mb-2">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{lead.ubicacion}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Package className="h-3 w-3 flex-shrink-0" />
            <span>{getCantidadText(lead.cantidad)}</span>
          </div>
        </div>

        {/* Etapa original */}
        <Badge variant="secondary" className={`text-xs mb-2 ${getEtapaColor(lead.etapa)}`}>
          {lead.etapa === 'listo-primer-pedido' && '🎯 Listo'}
          {lead.etapa === 'empezar-pronto' && '⚡ Pronto'}
          {lead.etapa === 'busco-mejor-proveedor' && '🔍 Busca'}
          {lead.etapa === 'buscando-opciones' && '👀 Explora'}
        </Badge>

        {/* Comentarios compactos */}
        {lead.comentarios && (
          <p className="text-xs text-gray-600 bg-gray-50 p-1 rounded mb-2 line-clamp-2">
            "{lead.comentarios.length > 50 ? lead.comentarios.substring(0, 50) + '...' : lead.comentarios}"
          </p>
        )}

        {/* Notas del CRM compactas */}
        {lead.notas && (
          <p className="text-xs text-blue-600 bg-blue-50 p-1 rounded mb-2 line-clamp-1">
            📝 {lead.notas.length > 30 ? lead.notas.substring(0, 30) + '...' : lead.notas}
          </p>
        )}

        {/* Fecha compacta */}
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(lead.createdAt)}</span>
        </div>

        {/* Botones de acción compactos */}
        <div className="grid grid-cols-2 gap-1">
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-7 px-2"
            onClick={(e) => {
              e.stopPropagation()
              onCall?.(lead)
            }}
          >
            <Phone className="h-3 w-3 mr-1" />
            Llamar
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-7 px-2 text-green-600 hover:text-green-700"
            onClick={(e) => {
              e.stopPropagation()
              onWhatsApp?.(lead)
            }}
          >
            <MessageCircle className="h-3 w-3 mr-1" />
            WhatsApp
          </Button>
        </div>
        
        {/* Email button si existe */}
        {lead.email && (
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs h-7 px-2 text-blue-600 hover:text-blue-700 mt-1"
            onClick={(e) => {
              e.stopPropagation()
              onEmail?.(lead)
            }}
          >
            <Mail className="h-3 w-3 mr-1" />
            Email
          </Button>
        )}
      </CardContent>
    </Card>
  )
} 