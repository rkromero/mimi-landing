'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Phone, MessageCircle, Mail, MapPin, Package, Calendar, DollarSign, User, Building, X, Clock, MessageSquare } from 'lucide-react'
import { useState } from 'react'

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
  const [showDetails, setShowDetails] = useState(false)
  
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
        return '🎯 Listo para primer pedido'
      case 'empezar-pronto':
        return '⚡ Empezar pronto'
      case 'busco-mejor-proveedor':
        return '🔍 Busca mejor proveedor'
      case 'buscando-opciones':
        return '👀 Explorando opciones'
      default:
        return etapa
    }
  }

  const cleanPhoneNumber = (phone: string) => {
    return phone.replace(/\D/g, '')
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // Solo abrir modal si no se está haciendo drag
    if (!isDragging) {
      e.preventDefault()
      e.stopPropagation()
      console.log('🎯 Clic en tarjeta:', lead.nombre)
      setShowDetails(true)
    }
  }

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('🎯 Clic en botón de detalles:', lead.nombre)
    console.log('🎯 Estado actual showDetails:', showDetails)
    setShowDetails(true)
    console.log('🎯 Estado después de setShowDetails:', true)
  }

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        className={`mb-2 hover:shadow-md transition-all duration-200 hover:scale-[1.02] ${
          isDragging ? 'shadow-lg' : ''
        }`}
      >
        {/* Área de drag and drop */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1"
        >
          <div className="w-full h-1 bg-gray-200 rounded-full mb-2"></div>
        </div>
        <CardContent className="p-3">
          {/* Header con nombre y valor */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-gray-900 truncate">{lead.nombre}</h3>
              <p className="text-xs text-gray-600 truncate">{lead.negocio}</p>
            </div>
            <div className="flex items-center gap-2">
              {lead.valor && (
                <div className="flex items-center gap-1 text-green-600">
                  <DollarSign className="h-3 w-3" />
                  <span className="text-xs font-medium">
                    ${lead.valor.toLocaleString()}
                  </span>
                </div>
              )}
              <div 
                className="text-xs text-gray-400 hover:text-[#E65C37] transition-colors cursor-pointer" 
                title="Haz clic para ver detalles completos"
                onClick={handleDetailsClick}
              >
                <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center hover:bg-[#E65C37] hover:text-white transition-colors">
                  <span className="text-[10px]">📋</span>
                </div>
              </div>
            </div>
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
              className="text-xs h-7 px-2 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                console.log('🔍 Botón Llamar clickeado:', lead.nombre)
                console.log('🔍 Función onCall disponible:', !!onCall)
                console.log('🔍 Número WhatsApp:', lead.whatsapp)
                if (onCall) {
                  onCall(lead)
                } else {
                  console.error('❌ Función onCall no está definida')
                  alert('Error: Función de llamada no está configurada')
                }
              }}
              title={`Llamar a ${lead.nombre}`}
            >
              <Phone className="h-3 w-3 mr-1" />
              Llamar
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7 px-2 text-green-600 hover:text-green-700 hover:bg-green-50 hover:border-green-300 transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                onWhatsApp?.(lead)
              }}
              title={`WhatsApp a ${lead.nombre}`}
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
              className="w-full text-xs h-7 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-300 mt-1 transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                onEmail?.(lead)
              }}
              title={`Email a ${lead.email}`}
            >
              <Mail className="h-3 w-3 mr-1" />
              Email
            </Button>
          )}

          {/* Botón para ver detalles */}
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs h-7 px-2 text-[#E65C37] hover:text-white hover:bg-[#E65C37] hover:border-[#E65C37] mt-2 transition-colors"
            onClick={handleDetailsClick}
          >
            <span className="mr-1">📋</span>
            Ver detalles completos
          </Button>
        </CardContent>
      </Card>

      {/* Modal de detalles completos */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles de {lead.nombre}</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p>Modal funcionando para: {lead.nombre}</p>
            <p>Negocio: {lead.negocio}</p>
            <p>Ubicación: {lead.ubicacion}</p>
            <Button onClick={() => setShowDetails(false)}>Cerrar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 