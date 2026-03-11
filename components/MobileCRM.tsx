'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
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
  AlertCircle,
  Trash2,
  Inbox,
  PhoneCall,
  RefreshCcw,
  CircleCheck,
  CircleX,
  LogOut,
  PackageCheck,
} from 'lucide-react'
import { Lead, LeadsPorEtapa } from '@/types/lead'
import { CreateLeadModal } from '@/components/CreateLeadModal'
import { CreateSellerModal } from '@/components/CreateSellerModal'
import { LucideIcon } from 'lucide-react'
import { CrmRole, CrmSeller } from '@/types/auth'

interface MobileCRMProps {
  leads: LeadsPorEtapa
  onCall: (lead: Lead) => void
  onWhatsApp: (lead: Lead) => void
  onEmail: (lead: Lead) => void
  onRefresh: () => void
  onLogout: () => void
  onSellerCreated: () => void
  onAssignSeller: (leadId: string, sellerId: string | null) => Promise<void>
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
  currentUserRole: CrmRole
  sellers: CrmSeller[]
  loading: boolean
}

const ETAPAS = [
  { id: 'entrante', title: 'Entrante', icon: Inbox, color: 'bg-blue-500' },
  { id: 'primer-llamado', title: 'Primer Llamado', icon: PhoneCall, color: 'bg-yellow-500' },
  { id: 'seguimiento', title: 'Seguimiento', icon: RefreshCcw, color: 'bg-purple-500' },
  { id: 'muestra-enviada', title: 'Muestra Enviada', icon: PackageCheck, color: 'bg-orange-500' },
  { id: 'ganado', title: 'Ganado', icon: CircleCheck, color: 'bg-green-500' },
  { id: 'perdido', title: 'Perdido', icon: CircleX, color: 'bg-red-500' }
] as const satisfies ReadonlyArray<{
  id: keyof LeadsPorEtapa
  title: string
  icon: LucideIcon
  color: string
}>

const UNASSIGNED_OPTION = '__UNASSIGNED__'

const filterLeadsBySeller = (leads: LeadsPorEtapa, sellerFilter: string) => {
  if (sellerFilter === 'all') return leads

  const isUnassigned = sellerFilter === UNASSIGNED_OPTION
  const filterColumn = (columnLeads: Lead[]) =>
    columnLeads.filter((lead) =>
      isUnassigned ? !lead.assignedToId : lead.assignedToId === sellerFilter
    )

  return {
    entrante: filterColumn(leads.entrante),
    'primer-llamado': filterColumn(leads['primer-llamado']),
    seguimiento: filterColumn(leads.seguimiento),
    'muestra-enviada': filterColumn(leads['muestra-enviada']),
    ganado: filterColumn(leads.ganado),
    perdido: filterColumn(leads.perdido),
  }
}

export function MobileCRM({
  leads,
  onCall,
  onWhatsApp,
  onEmail,
  onRefresh,
  onLogout,
  onSellerCreated,
  onAssignSeller,
  onUpdateLead,
  currentUserRole,
  sellers,
  loading,
}: MobileCRMProps) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [updatingLead, setUpdatingLead] = useState(false)
  const [updateMessage, setUpdateMessage] = useState<string | null>(null)
  const [deletingLead, setDeletingLead] = useState(false)
  const [sellerFilter, setSellerFilter] = useState('all')

  const isAdmin = currentUserRole === 'ADMIN'
  const visibleLeads = useMemo(
    () => (isAdmin ? filterLeadsBySeller(leads, sellerFilter) : leads),
    [isAdmin, leads, sellerFilter]
  )

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
    let motivoPerdido: string | undefined

    if (nuevaEtapa === 'perdido') {
      const answer = window.prompt(
        'Elegí motivo de perdido:\n1) precio\n2) minorista\n3) en-otro-momento\n4) pago-anticipado',
        'precio'
      )
      const value = (answer || '').trim().toLowerCase()
      const allowed = ['precio', 'minorista', 'en-otro-momento', 'pago-anticipado']
      if (!allowed.includes(value)) {
        setUpdateMessage('Motivo inválido. Debe ser: precio, minorista, en-otro-momento o pago-anticipado')
        setTimeout(() => setUpdateMessage(null), 3000)
        return
      }
      motivoPerdido = value
    }
    
    setUpdatingLead(true)
    setUpdateMessage(null)
    
    try {
      if (onUpdateLead) {
        await onUpdateLead(selectedLead.id, {
          nuevaEtapa,
          motivoPerdido,
        })
        setUpdateMessage(`Lead movido a ${getEtapaInfo(nuevaEtapa)?.title}`)
        setSelectedLead({
          ...selectedLead,
          etapaCrm: nuevaEtapa
        })
        setTimeout(() => {
          onRefresh()
          setUpdateMessage(null)
        }, 1500)
      } else {
        const response = await fetch('/api/crm', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            leadId: selectedLead.id,
            nuevaEtapa,
            motivoPerdido,
          }),
        })

        if (!response.ok) {
          throw new Error('Error al actualizar')
        }
        setUpdateMessage(`Lead movido a ${getEtapaInfo(nuevaEtapa)?.title}`)
        setSelectedLead({
          ...selectedLead,
          etapaCrm: nuevaEtapa
        })
        setTimeout(() => {
          onRefresh()
          setUpdateMessage(null)
        }, 1500)
      }
    } catch (error) {
      console.error('Error al cambiar etapa:', error)
      setUpdateMessage('Error al actualizar el lead')
      setTimeout(() => setUpdateMessage(null), 3000)
    } finally {
      setUpdatingLead(false)
    }
  }

  // Función para eliminar lead
  const handleDeleteLead = async () => {
    if (!selectedLead) return
    
    setDeletingLead(true)
    setUpdateMessage(null)
    
    try {
      const response = await fetch('/api/crm', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadId: selectedLead.id,
        }),
      })

      if (response.ok) {
        setUpdateMessage(`Lead "${selectedLead.nombre}" eliminado correctamente`)
        // Esperar un momento para mostrar el mensaje y luego volver a la lista
        setTimeout(() => {
          setSelectedLead(null)
          onRefresh()
          setUpdateMessage(null)
        }, 2000)
      } else {
        throw new Error('Error al eliminar')
      }
    } catch (error) {
      console.error('Error al eliminar lead:', error)
      setUpdateMessage('Error al eliminar el lead')
      setTimeout(() => setUpdateMessage(null), 3000)
    } finally {
      setDeletingLead(false)
    }
  }

  const handleAssignSeller = async (sellerId: string) => {
    if (!selectedLead || !isAdmin) return
    setUpdatingLead(true)
    setUpdateMessage(null)

    try {
      await onAssignSeller(
        selectedLead.id,
        sellerId === UNASSIGNED_OPTION ? null : sellerId
      )
      setUpdateMessage('Vendedor actualizado')
      setTimeout(() => {
        onRefresh()
        setUpdateMessage(null)
      }, 1000)
    } catch {
      setUpdateMessage('Error al actualizar vendedor')
      setTimeout(() => setUpdateMessage(null), 2500)
    } finally {
      setUpdatingLead(false)
    }
  }

  // Calcular estadísticas
  const totalLeads = Object.values(visibleLeads).reduce((sum, columnLeads) => sum + columnLeads.length, 0)
  const totalValue = Object.values(visibleLeads).flat().reduce((sum, lead) => sum + (lead.valor || 0), 0)
  const conversionRate = totalLeads > 0 ? ((visibleLeads.ganado.length / totalLeads) * 100).toFixed(1) : '0'

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b16] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-indigo-300" />
          <p className="text-slate-300">Cargando CRM...</p>
        </div>
      </div>
    )
  }

  // Vista detalle de lead
  if (selectedLead) {
    const currentEtapaInfo = getEtapaInfo(selectedLead.etapaCrm)
    
    return (
      <div className="min-h-screen bg-[#070b16] text-slate-100">
        {/* Header del detalle */}
        <div className="bg-[#0b1020] border-b border-white/10 sticky top-0 z-10">
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
                <h1 className="text-lg font-bold text-slate-100 truncate">{selectedLead.nombre}</h1>
                <p className="text-sm text-slate-400 truncate">{selectedLead.negocio}</p>
              </div>
              {/* Botón Eliminar en el header */}
              {isAdmin ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="mx-4 bg-[#10182b] border-white/10 text-slate-100">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                        <Trash2 className="h-5 w-5" />
                        Eliminar Lead
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-slate-300">
                        ¿Estás seguro de que querés eliminar el lead de <span className="font-semibold">{selectedLead.nombre}</span>? 
                        <br /><br />
                        Esta acción no se puede deshacer y se perderán todos los datos del lead.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                      <AlertDialogCancel className="w-full sm:w-auto">
                        No, cancelar
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteLead}
                        disabled={deletingLead}
                        className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
                      >
                        {deletingLead ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Eliminando...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Sí, eliminar
                          </>
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : null}
            </div>
          </div>
        </div>

        {/* Mensaje de actualización */}
        {updateMessage && (
          <div className="bg-[#0b1020] border-b border-white/10">
            <div className="px-4 py-3">
              <div className={`text-sm text-center p-2 rounded ${
                !updateMessage.startsWith('Error')
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
          <Card className="border border-orange-400/30 bg-orange-500/10 text-slate-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <ArrowRight className="h-5 w-5 text-orange-600" />
                Cambiar Estado del Lead
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Estado Actual */}
              <div>
                <p className="text-sm font-medium text-slate-300 mb-2">Estado Actual:</p>
                <div className="flex items-center gap-2 p-3 bg-[#10182b] rounded-lg border border-white/10">
                  {currentEtapaInfo?.icon ? (
                    <currentEtapaInfo.icon className="h-5 w-5" aria-hidden="true" />
                  ) : null}
                  <span className="font-medium">{currentEtapaInfo?.title}</span>
                </div>
              </div>

              {/* Selector de Nueva Etapa */}
              <div>
                <p className="text-sm font-medium text-slate-300 mb-2">Mover a:</p>
                <Select onValueChange={handleEtapaChange} disabled={updatingLead || deletingLead}>
                  <SelectTrigger className="w-full h-12 text-left bg-[#10182b] border-white/10 text-slate-100">
                    <SelectValue placeholder="Seleccionar nueva etapa..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#10182b] border-white/10 text-slate-100">
                    {ETAPAS
                      .filter(etapa => etapa.id !== selectedLead.etapaCrm)
                      .map((etapa) => (
                        <SelectItem key={etapa.id} value={etapa.id}>
                          <div className="flex items-center gap-3">
                            <etapa.icon className="h-4 w-4" aria-hidden="true" />
                            <span className="font-medium">{etapa.title}</span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {isAdmin ? (
                <div>
                  <p className="text-sm font-medium text-slate-300 mb-2">Vendedor asignado:</p>
                  <Select
                    value={selectedLead.assignedToId ?? UNASSIGNED_OPTION}
                    onValueChange={handleAssignSeller}
                    disabled={updatingLead || deletingLead}
                  >
                    <SelectTrigger className="w-full h-12 text-left bg-[#10182b] border-white/10 text-slate-100">
                      <SelectValue placeholder="Seleccionar vendedor..." />
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
              ) : null}

              {(updatingLead || deletingLead) && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  {updatingLead ? 'Actualizando estado...' : 'Eliminando lead...'}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Información principal */}
          <Card className="bg-[#10182b] border-white/10 text-slate-100">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-400" />
                <span className="text-sm">{selectedLead.provincia}, {selectedLead.localidad}</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-slate-400" />
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
                <Calendar className="h-4 w-4 text-slate-400" />
                <span className="text-sm">{formatDate(selectedLead.createdAt)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Etapa */}
          <Card className="bg-[#10182b] border-white/10 text-slate-100">
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">Etapa Original</h3>
              <Badge variant="secondary" className={getEtapaColor(selectedLead.etapa)}>
                {selectedLead.etapa === 'listo-primer-pedido' && 'Listo para primer pedido'}
                {selectedLead.etapa === 'empezar-pronto' && 'Empezar pronto'}
                {selectedLead.etapa === 'busco-mejor-proveedor' && 'Busca mejor proveedor'}
                {selectedLead.etapa === 'buscando-opciones' && 'Explorando opciones'}
              </Badge>
            </CardContent>
          </Card>

          {/* Comentarios */}
          {selectedLead.comentarios && (
            <Card className="bg-[#10182b] border-white/10 text-slate-100">
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">Comentarios del Cliente</h3>
                <p className="text-sm text-slate-200 bg-white/5 p-3 rounded border border-white/10">
                  "{selectedLead.comentarios}"
                </p>
              </CardContent>
            </Card>
          )}

          {/* Notas CRM */}
          {selectedLead.notas && (
            <Card className="bg-[#10182b] border-white/10 text-slate-100">
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">Notas del CRM</h3>
                <p className="text-sm text-blue-200 bg-blue-500/10 p-3 rounded border border-blue-400/20">
                  {selectedLead.notas}
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
              disabled={deletingLead}
            >
              <Phone className="h-5 w-5 mr-3" />
              Llamar a {selectedLead.nombre}
            </Button>
            
            <Button
              size="lg"
              className="w-full h-14 text-base bg-green-600 hover:bg-green-700"
              onClick={() => onWhatsApp(selectedLead)}
              disabled={deletingLead}
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
                disabled={deletingLead}
              >
                <Mail className="h-5 w-5 mr-3" />
                Enviar Email
              </Button>
            )}

            {/* Botón de Eliminar grande y destacado */}
            {isAdmin ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="lg"
                    variant="destructive"
                    className="w-full h-14 text-base bg-red-600 hover:bg-red-700"
                    disabled={deletingLead}
                  >
                    <Trash2 className="h-5 w-5 mr-3" />
                    Eliminar Lead
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="mx-4">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-5 w-5" />
                      ¿Eliminar este lead?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-600">
                      ¿Estás seguro de que querés eliminar el lead de <span className="font-semibold text-gray-900">{selectedLead.nombre}</span>? 
                      <br /><br />
                      <span className="text-red-600 font-medium">Esta acción no se puede deshacer</span> y se perderán todos los datos del lead.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                    <AlertDialogCancel className="w-full sm:w-auto order-2 sm:order-1">
                      No, cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteLead}
                      disabled={deletingLead}
                      className="w-full sm:w-auto order-1 sm:order-2 bg-red-600 hover:bg-red-700 text-white"
                    >
                      {deletingLead ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Eliminando...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Sí, eliminar
                        </>
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : null}
          </div>
        </div>
      </div>
    )
  }

  // Vista principal con tabs
  return (
      <div className="min-h-screen bg-[#070b16] text-slate-100">
      {/* Header compacto */}
      <div className="bg-[#0b1020] border-b border-white/10 sticky top-0 z-20">
        <div className="px-4 py-3">
          <div className="space-y-3">
            <div>
              <h1 className="text-xl font-bold text-slate-100">CRM MIMI</h1>
              <p className="text-sm text-slate-400">Gestión de Leads</p>
            </div>
            <div className="flex items-center gap-2">
              {isAdmin ? (
                <CreateSellerModal
                  onSellerCreated={onSellerCreated}
                  compact
                  triggerClassName="h-9 w-9 p-0 border-white/20 bg-white/5 text-slate-100 hover:bg-white/10"
                />
              ) : null}
              <CreateLeadModal
                onLeadCreated={onRefresh}
                compact
                triggerClassName="h-9 w-9 p-0 bg-green-600 hover:bg-green-700"
              />
              <Button onClick={onRefresh} variant="outline" size="sm" className="h-9 w-9 p-0 border-white/20 bg-white/5 text-slate-100 hover:bg-white/10">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button onClick={onLogout} variant="outline" size="sm" className="h-9 w-9 p-0 border-white/20 bg-white/5 text-slate-100 hover:bg-white/10">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {isAdmin ? (
        <div className="bg-[#0b1020] border-b border-white/10">
          <div className="px-4 py-3">
            <Select value={sellerFilter} onValueChange={setSellerFilter}>
              <SelectTrigger className="w-full bg-[#10182b] border-white/10 text-slate-100">
                <SelectValue placeholder="Filtrar por vendedor" />
              </SelectTrigger>
              <SelectContent className="bg-[#10182b] border-white/10 text-slate-100">
                <SelectItem value="all">Todos los vendedores</SelectItem>
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

      {/* Estadísticas compactas */}
      <div className="bg-[#0b1020] border-b border-white/10">
        <div className="px-4 py-3">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-slate-100">{totalLeads}</div>
              <div className="text-xs text-slate-400">Leads</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">${totalValue.toLocaleString()}</div>
              <div className="text-xs text-slate-400">Valor</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">{conversionRate}%</div>
              <div className="text-xs text-slate-400">Conversión</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs de etapas */}
      <Tabs defaultValue="entrante" className="flex flex-col h-[calc(100vh-208px)]">
        <TabsList className="grid w-full grid-cols-5 bg-[#0b1020] border-b border-white/10 rounded-none h-auto">
          {ETAPAS.map((etapa) => (
            <TabsTrigger
              key={etapa.id}
              value={etapa.id}
              className="flex flex-col gap-1 py-3 px-1 data-[state=active]:bg-[#10182b] data-[state=active]:text-slate-100 text-slate-300"
            >
              <etapa.icon className="h-4 w-4" aria-hidden="true" />
              <span className="text-xs font-medium truncate">{etapa.title}</span>
              <Badge variant="secondary" className="text-xs bg-white/10 text-slate-200">
                {visibleLeads[etapa.id as keyof LeadsPorEtapa].length}
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
              {visibleLeads[etapa.id as keyof LeadsPorEtapa].length === 0 ? (
                <div className="text-center py-12">
                  <etapa.icon className="h-10 w-10 mx-auto mb-3 text-slate-500" aria-hidden="true" />
                  <p className="text-slate-500">No hay leads en esta etapa</p>
                </div>
              ) : (
                visibleLeads[etapa.id as keyof LeadsPorEtapa].map((lead) => (
                  <Card
                    key={lead.id}
                    className="cursor-pointer transition-colors border border-white/10 bg-[#10182b] hover:bg-[#16213a] border-l-4 border-l-orange-400"
                    onClick={() => setSelectedLead(lead)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-100 truncate">{lead.nombre}</h3>
                          <p className="text-sm text-slate-400 truncate">{lead.negocio}</p>
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
                        <span className="truncate">{lead.provincia}, {lead.localidad}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className={`text-xs ${getEtapaColor(lead.etapa)}`}>
                          {lead.etapa === 'listo-primer-pedido' && 'Listo'}
                          {lead.etapa === 'empezar-pronto' && 'Pronto'}
                          {lead.etapa === 'busco-mejor-proveedor' && 'Busca'}
                          {lead.etapa === 'buscando-opciones' && 'Explora'}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">
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