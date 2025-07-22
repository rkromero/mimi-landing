'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Phone, 
  MessageCircle, 
  Mail, 
  MapPin, 
  Package, 
  DollarSign, 
  Calendar,
  Users,
  BarChart3,
  TrendingUp,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Check,
  AlertCircle
} from 'lucide-react'

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

interface MobileCRMProps {
  leads: LeadsPorEtapa
  onCall: (lead: Lead) => void
  onWhatsApp: (lead: Lead) => void
  onEmail: (lead: Lead) => void
  onRefresh: () => void
  loading: boolean
}

const ETAPAS = [
  { id: 'entrante', title: 'Entrante', icon: '📨', color: 'bg-blue-500' },
  { id: 'primer-llamado', title: 'Primer Llamado', icon: '📞', color: 'bg-yellow-500' },
  { id: 'seguimiento', title: 'Seguimiento', icon: '🔄', color: 'bg-purple-500' },
  { id: 'ganado', title: 'Ganado', icon: '🎉', color: 'bg-green-500' },
  { id: 'perdido', title: 'Perdido', icon: '❌', color: 'bg-red-500' }
]

export function MobileCRM({ leads, onCall, onWhatsApp, onEmail, onRefresh, loading }: MobileCRMProps) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [updatingLead, setUpdatingLead] = useState(false)
  const [updateMessage, setUpdateMessage] = useState<string | null>(null)

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

  const getEtapaInfo = (etapaId: string) => {
    return ETAPAS.find(e => e.id === etapaId)
  }

  // Función para cambiar etapa de lead
  const handleEtapaChange = async (nuevaEtapa: string) => {
    if (!selectedLead || nuevaEtapa === selectedLead.etapaCrm) return
    
    setUpdatingLead(true)
    setUpdateMessage(null)
    
    try {
      const response = await fetch('/api/crm', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadId: selectedLead.id,
          nuevaEtapa: nuevaEtapa,
        }),
      })

      if (response.ok) {
        setUpdateMessage(`✅ Lead movido a ${getEtapaInfo(nuevaEtapa)?.title}`)
        // Actualizar el lead seleccionado localmente
        setSelectedLead({
          ...selectedLead,
          etapaCrm: nuevaEtapa
        })
        // Refrescar los datos después de un breve delay
        setTimeout(() => {
          onRefresh()
          setUpdateMessage(null)
        }, 1500)
      } else {
        throw new Error('Error al actualizar')
      }
    } catch (error) {
      console.error('Error al cambiar etapa:', error)
      setUpdateMessage('❌ Error al actualizar el lead')
      setTimeout(() => setUpdateMessage(null), 3000)
    } finally {
      setUpdatingLead(false)
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

  // Vista detalle de lead
  if (selectedLead) {
    const currentEtapaInfo = getEtapaInfo(selectedLead.etapaCrm)
    
    return (
      <div className="min-h-screen bg-gray-100">
        {/* Header del detalle */}
        <div className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedLead(null)}
                className="p-2"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1">
                <h1 className="text-lg font-bold text-gray-900 truncate">{selectedLead.nombre}</h1>
                <p className="text-sm text-gray-600 truncate">{selectedLead.negocio}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mensaje de actualización */}
        {updateMessage && (
          <div className="bg-white border-b">
            <div className="px-4 py-3">
              <div className={`text-sm text-center p-2 rounded ${
                updateMessage.startsWith('✅') 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {updateMessage}
              </div>
            </div>
          </div>
        )}

        {/* Contenido del detalle */}
        <div className="p-4 space-y-4">
          {/* Cambiar Etapa - Sección Principal */}
          <Card className="border-2 border-orange-200 bg-orange-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <ArrowRight className="h-5 w-5 text-orange-600" />
                Cambiar Estado del Lead
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Estado Actual */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Estado Actual:</p>
                <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                  <span className="text-lg">{currentEtapaInfo?.icon}</span>
                  <span className="font-medium">{currentEtapaInfo?.title}</span>
                </div>
              </div>

              {/* Selector de Nueva Etapa */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Mover a:</p>
                <Select onValueChange={handleEtapaChange} disabled={updatingLead}>
                  <SelectTrigger className="w-full h-12 text-left bg-white">
                    <SelectValue placeholder="Seleccionar nueva etapa..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ETAPAS
                      .filter(etapa => etapa.id !== selectedLead.etapaCrm)
                      .map((etapa) => (
                        <SelectItem key={etapa.id} value={etapa.id}>
                          <div className="flex items-center gap-3">
                            <span className="text-base">{etapa.icon}</span>
                            <span className="font-medium">{etapa.title}</span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {updatingLead && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Actualizando estado...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Información principal */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{selectedLead.ubicacion}</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{getCantidadText(selectedLead.cantidad)}</span>
              </div>
              {selectedLead.valor && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">
                    ${selectedLead.valor.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{formatDate(selectedLead.createdAt)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Etapa */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">Etapa Original</h3>
              <Badge variant="secondary" className={getEtapaColor(selectedLead.etapa)}>
                {selectedLead.etapa === 'listo-primer-pedido' && '🎯 Listo para primer pedido'}
                {selectedLead.etapa === 'empezar-pronto' && '⚡ Empezar pronto'}
                {selectedLead.etapa === 'busco-mejor-proveedor' && '🔍 Busca mejor proveedor'}
                {selectedLead.etapa === 'buscando-opciones' && '👀 Explorando opciones'}
              </Badge>
            </CardContent>
          </Card>

          {/* Comentarios */}
          {selectedLead.comentarios && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">Comentarios del Cliente</h3>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  "{selectedLead.comentarios}"
                </p>
              </CardContent>
            </Card>
          )}

          {/* Notas CRM */}
          {selectedLead.notas && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">Notas del CRM</h3>
                <p className="text-sm text-blue-600 bg-blue-50 p-3 rounded">
                  📝 {selectedLead.notas}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Botones de acción grandes */}
          <div className="space-y-3 pb-8">
            <Button
              size="lg"
              className="w-full h-14 text-base bg-blue-600 hover:bg-blue-700"
              onClick={() => onCall(selectedLead)}
            >
              <Phone className="h-5 w-5 mr-3" />
              Llamar a {selectedLead.nombre}
            </Button>
            
            <Button
              size="lg"
              className="w-full h-14 text-base bg-green-600 hover:bg-green-700"
              onClick={() => onWhatsApp(selectedLead)}
            >
              <MessageCircle className="h-5 w-5 mr-3" />
              WhatsApp
            </Button>
            
            {selectedLead.email && (
              <Button
                size="lg"
                variant="outline"
                className="w-full h-14 text-base border-2"
                onClick={() => onEmail(selectedLead)}
              >
                <Mail className="h-5 w-5 mr-3" />
                Enviar Email
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Vista principal con tabs
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header compacto */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">CRM MIMI</h1>
              <p className="text-sm text-gray-600">Gestión de Leads</p>
            </div>
            <Button onClick={onRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Estadísticas compactas */}
      <div className="bg-white border-b">
        <div className="px-4 py-3">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-gray-900">{totalLeads}</div>
              <div className="text-xs text-gray-600">Leads</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">${totalValue.toLocaleString()}</div>
              <div className="text-xs text-gray-600">Valor</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">{conversionRate}%</div>
              <div className="text-xs text-gray-600">Conversión</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs de etapas */}
      <Tabs defaultValue="entrante" className="flex flex-col h-[calc(100vh-140px)]">
        <TabsList className="grid w-full grid-cols-5 bg-white border-b rounded-none h-auto">
          {ETAPAS.map((etapa) => (
            <TabsTrigger
              key={etapa.id}
              value={etapa.id}
              className="flex flex-col gap-1 py-3 px-2 data-[state=active]:bg-gray-100"
            >
              <span className="text-base">{etapa.icon}</span>
              <span className="text-xs font-medium truncate">{etapa.title}</span>
              <Badge variant="secondary" className="text-xs">
                {leads[etapa.id as keyof LeadsPorEtapa].length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {ETAPAS.map((etapa) => (
          <TabsContent
            key={etapa.id}
            value={etapa.id}
            className="flex-1 mt-0 overflow-y-auto"
          >
            <div className="p-4 space-y-3">
              {leads[etapa.id as keyof LeadsPorEtapa].length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">{etapa.icon}</div>
                  <p className="text-gray-500">No hay leads en esta etapa</p>
                </div>
              ) : (
                leads[etapa.id as keyof LeadsPorEtapa].map((lead) => (
                  <Card
                    key={lead.id}
                    className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-orange-400"
                    onClick={() => setSelectedLead(lead)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{lead.nombre}</h3>
                          <p className="text-sm text-gray-600 truncate">{lead.negocio}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          {lead.valor && (
                            <div className="flex items-center gap-1 text-green-600">
                              <DollarSign className="h-4 w-4" />
                              <span className="text-sm font-medium">
                                ${lead.valor.toLocaleString()}
                              </span>
                            </div>
                          )}
                          <div className="bg-orange-100 p-1 rounded">
                            <ArrowRight className="h-4 w-4 text-orange-600" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{lead.ubicacion}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className={`text-xs ${getEtapaColor(lead.etapa)}`}>
                          {lead.etapa === 'listo-primer-pedido' && '🎯 Listo'}
                          {lead.etapa === 'empezar-pronto' && '⚡ Pronto'}
                          {lead.etapa === 'busco-mejor-proveedor' && '🔍 Busca'}
                          {lead.etapa === 'buscando-opciones' && '👀 Explora'}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {formatDate(lead.createdAt)}
                          </span>
                          <div className="text-orange-600">
                            <span className="text-xs font-medium">Tocar para gestionar</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
} 