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
      className={`mb-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${
        isDragging ? 'shadow-lg' : ''
      }`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <User className="h-4 w-4 text-gray-600" />
              <h3 className="font-semibold text-sm">{lead.nombre}</h3>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Building className="h-4 w-4 text-gray-600" />
              <p className="text-sm text-gray-600">{lead.negocio}</p>
            </div>
          </div>
          {lead.valor && (
            <div className="flex items-center gap-1 text-green-600">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm font-medium">
                ${lead.valor.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-2">
          {/* Ubicación y Cantidad */}
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{lead.ubicacion}</span>
            </div>
            <div className="flex items-center gap-1">
              <Package className="h-3 w-3" />
              <span>{getCantidadText(lead.cantidad)}</span>
            </div>
          </div>

          {/* Etapa original */}
          <Badge variant="secondary" className={`text-xs ${getEtapaColor(lead.etapa)}`}>
            {lead.etapa === 'listo-primer-pedido' && '🎯 Listo para comprar'}
            {lead.etapa === 'empezar-pronto' && '⚡ Empezar pronto'}
            {lead.etapa === 'busco-mejor-proveedor' && '🔍 Busca proveedor'}
            {lead.etapa === 'buscando-opciones' && '👀 Explorando'}
          </Badge>

          {/* Comentarios */}
          {lead.comentarios && (
            <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
              "{lead.comentarios}"
            </p>
          )}

          {/* Notas del CRM */}
          {lead.notas && (
            <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
              📝 {lead.notas}
            </p>
          )}

          {/* Fecha */}
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(lead.createdAt)}</span>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-1 pt-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs h-8"
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
              className="flex-1 text-xs h-8 text-green-600 hover:text-green-700"
              onClick={(e) => {
                e.stopPropagation()
                onWhatsApp?.(lead)
              }}
            >
              <MessageCircle className="h-3 w-3 mr-1" />
              WhatsApp
            </Button>
            {lead.email && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs h-8 text-blue-600 hover:text-blue-700"
                onClick={(e) => {
                  e.stopPropagation()
                  onEmail?.(lead)
                }}
              >
                <Mail className="h-3 w-3 mr-1" />
                Email
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 