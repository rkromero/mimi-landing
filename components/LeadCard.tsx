'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Phone, MessageCircle, Mail, MapPin, Calendar, User, ArrowRight, Save, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Lead } from '@/types/lead'
import { CrmSeller } from '@/types/auth'
import { toast } from '@/hooks/use-toast'

interface LeadCardProps {
  lead: Lead
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

const UNASSIGNED_OPTION = '__UNASSIGNED__'
const LOST_REASON_OPTIONS = [
  { value: 'precio', label: 'Precio' },
  { value: 'minorista', label: 'Minorista' },
  { value: 'en-otro-momento', label: 'En otro momento' },
  { value: 'pago-anticipado', label: 'Pago anticipado' },
] as const
const CRM_STAGE_OPTIONS = [
  { value: 'entrante', label: 'Entrante' },
  { value: 'primer-llamado', label: 'Primer llamado' },
  { value: 'seguimiento', label: 'Seguimiento' },
  { value: 'ganado', label: 'Ganado' },
  { value: 'perdido', label: 'Perdido' },
] as const
const PURCHASE_STAGE_OPTIONS = [
  { value: 'buscando-opciones', label: 'Estoy buscando opciones, sin apuro' },
  { value: 'empezar-pronto', label: 'Me interesa empezar pronto' },
  { value: 'listo-primer-pedido', label: 'Estoy listo para hacer mi primer pedido' },
  { value: 'busco-mejor-proveedor', label: 'Ya vendo alfajores y busco mejor proveedor' },
] as const
const VOLUME_OPTIONS = [
  { value: 'menos-24', label: 'Menos de 24 docenas' },
  { value: '24-100', label: 'Entre 24 y 100 docenas' },
  { value: 'mas-100', label: 'Más de 100 docenas' },
] as const

export function LeadCard({
  lead,
  onCall,
  onWhatsApp,
  onEmail,
  isAdmin = false,
  sellers = [],
  onAssignSeller,
  onDeleteLead,
  onUpdateLead,
}: LeadCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [assigningSeller, setAssigningSeller] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [crmStage, setCrmStage] = useState(lead.etapaCrm)
  const [lostReason, setLostReason] = useState('')
  const [formData, setFormData] = useState({
    nombre: lead.nombre,
    negocio: lead.negocio,
    provincia: lead.provincia,
    localidad: lead.localidad,
    whatsapp: lead.whatsapp,
    email: lead.email ?? '',
    comentarios: lead.comentarios ?? '',
    cantidad: lead.cantidad,
    etapa: lead.etapa,
  })
  
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

  const inferLostReason = (notes?: string) => {
    if (!notes) return ''
    if (notes.includes('Motivo de perdido: Precio')) return 'precio'
    if (notes.includes('Motivo de perdido: Minorista')) return 'minorista'
    if (notes.includes('Motivo de perdido: En otro momento')) return 'en-otro-momento'
    if (notes.includes('Motivo de perdido: Pago anticipado')) return 'pago-anticipado'
    return ''
  }

  useEffect(() => {
    if (!showDetails) return
    setCrmStage(lead.etapaCrm)
    setLostReason(inferLostReason(lead.notas))
    setFormData({
      nombre: lead.nombre,
      negocio: lead.negocio,
      provincia: lead.provincia,
      localidad: lead.localidad,
      whatsapp: lead.whatsapp,
      email: lead.email ?? '',
      comentarios: lead.comentarios ?? '',
      cantidad: lead.cantidad,
      etapa: lead.etapa,
    })
  }, [showDetails, lead])

  const handleSave = async () => {
    if (!onUpdateLead) return
    if (!formData.nombre.trim() || !formData.negocio.trim() || !formData.provincia.trim() || !formData.localidad.trim() || !formData.whatsapp.trim()) {
      toast({
        title: 'Faltan campos obligatorios',
        description: 'Nombre, negocio, provincia, localidad y WhatsApp son obligatorios.',
        variant: 'destructive',
      })
      return
    }

    if (crmStage === 'perdido' && !lostReason) {
      toast({
        title: 'Motivo obligatorio',
        description: 'Para marcar un lead como perdido debes indicar un motivo.',
        variant: 'destructive',
      })
      return
    }

    try {
      setSaving(true)
      await onUpdateLead(lead.id, {
        ...formData,
        nuevaEtapa: crmStage,
        motivoPerdido: crmStage === 'perdido' ? lostReason : undefined,
      })
      toast({
        title: 'Lead actualizado',
        description: 'Los cambios se guardaron correctamente.',
      })
    } catch (error) {
      toast({
        title: 'No se pudo guardar',
        description: error instanceof Error ? error.message : 'Error inesperado',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
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
            <div className="flex items-center gap-1.5">
              {isAdmin && onDeleteLead ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      type="button"
                      aria-label={`Eliminar lead ${lead.nombre}`}
                      className="h-6 w-6 rounded-md border border-red-400/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-colors flex items-center justify-center"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-[#0f162d] border-white/10 text-slate-100">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Eliminar lead</AlertDialogTitle>
                      <AlertDialogDescription className="text-slate-300">
                        ¿Seguro que querés eliminar a <span className="font-medium text-slate-100">{lead.nombre}</span>?
                        Esta acción no se puede deshacer.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-white/15 bg-white/5 text-slate-100 hover:bg-white/10">
                        Cancelar
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700 text-white"
                        disabled={deleting}
                        onClick={async () => {
                          try {
                            setDeleting(true)
                            await onDeleteLead(lead.id)
                            toast({
                              title: 'Lead eliminado',
                              description: 'Se eliminó correctamente.',
                            })
                          } catch (error) {
                            toast({
                              title: 'No se pudo eliminar',
                              description: error instanceof Error ? error.message : 'Error inesperado',
                              variant: 'destructive',
                            })
                          } finally {
                            setDeleting(false)
                          }
                        }}
                      >
                        {deleting ? 'Eliminando...' : 'Eliminar'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : null}
              {lead.valor ? (
                <div className="text-[11px] text-slate-300 bg-white/10 px-2 py-0.5 rounded">
                  ${lead.valor.toLocaleString()}
                </div>
              ) : null}
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
          className="w-full sm:max-w-2xl max-h-screen overflow-y-auto bg-[#0b1328] text-slate-100 border-white/10"
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
            <div className="bg-[#0f1a34] border border-white/10 rounded-xl p-5">
              <h3 className="text-base font-semibold text-slate-100 mb-4">Gestión del lead</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Etapa CRM</Label>
                  <Select value={crmStage} onValueChange={setCrmStage}>
                    <SelectTrigger className="h-11 bg-[#0b1328] border-white/10 text-slate-100 focus-visible:ring-indigo-400">
                      <SelectValue placeholder="Seleccionar etapa" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0b1328] border-white/10 text-slate-100">
                      {CRM_STAGE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {crmStage === 'perdido' ? (
                  <div className="space-y-2">
                    <Label className="text-slate-300">Motivo de perdido *</Label>
                    <Select value={lostReason} onValueChange={setLostReason}>
                      <SelectTrigger className="h-11 bg-[#0b1328] border-white/10 text-slate-100 focus-visible:ring-indigo-400">
                        <SelectValue placeholder="Seleccionar motivo" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0b1328] border-white/10 text-slate-100">
                        {LOST_REASON_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}
              </div>
            </div>

            {isAdmin && onAssignSeller ? (
              <div className="bg-[#0f1a34] border border-white/10 rounded-xl p-5">
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
                    <SelectTrigger className="h-11 bg-[#0b1328] border-white/10 text-slate-100 focus-visible:ring-indigo-400">
                      <SelectValue placeholder="Seleccionar vendedor" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0b1328] border-white/10 text-slate-100">
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

            <div className="bg-gradient-to-r from-[#1a2550] to-[#1a2f5f] text-white rounded-xl p-5 border border-indigo-400/20">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs opacity-90">Lead desde</p>
                  <p className="font-semibold">{formatDate(lead.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs opacity-90">Etapa actual</p>
                  <p className="font-semibold capitalize">{crmStage.replace('-', ' ')}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#0f1a34] border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-slate-100 mb-4">Editar contacto</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`lead-nombre-${lead.id}`}>Nombre *</Label>
                  <Input
                    id={`lead-nombre-${lead.id}`}
                    value={formData.nombre}
                    onChange={(event) => setFormData((prev) => ({ ...prev, nombre: event.target.value }))}
                    className="h-11 bg-[#0b1328] border-white/10 text-slate-100 focus-visible:ring-indigo-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`lead-negocio-${lead.id}`}>Negocio *</Label>
                  <Input
                    id={`lead-negocio-${lead.id}`}
                    value={formData.negocio}
                    onChange={(event) => setFormData((prev) => ({ ...prev, negocio: event.target.value }))}
                    className="h-11 bg-[#0b1328] border-white/10 text-slate-100 focus-visible:ring-indigo-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`lead-whatsapp-${lead.id}`}>WhatsApp *</Label>
                  <Input
                    id={`lead-whatsapp-${lead.id}`}
                    value={formData.whatsapp}
                    onChange={(event) => setFormData((prev) => ({ ...prev, whatsapp: event.target.value }))}
                    className="h-11 bg-[#0b1328] border-white/10 text-slate-100 focus-visible:ring-indigo-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`lead-email-${lead.id}`}>Email</Label>
                  <Input
                    id={`lead-email-${lead.id}`}
                    type="email"
                    value={formData.email}
                    onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                    className="h-11 bg-[#0b1328] border-white/10 text-slate-100 focus-visible:ring-indigo-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`lead-provincia-${lead.id}`}>Provincia *</Label>
                  <Input
                    id={`lead-provincia-${lead.id}`}
                    value={formData.provincia}
                    onChange={(event) => setFormData((prev) => ({ ...prev, provincia: event.target.value }))}
                    className="h-11 bg-[#0b1328] border-white/10 text-slate-100 focus-visible:ring-indigo-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`lead-localidad-${lead.id}`}>Localidad *</Label>
                  <Input
                    id={`lead-localidad-${lead.id}`}
                    value={formData.localidad}
                    onChange={(event) => setFormData((prev) => ({ ...prev, localidad: event.target.value }))}
                    className="h-11 bg-[#0b1328] border-white/10 text-slate-100 focus-visible:ring-indigo-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Volumen estimado *</Label>
                  <Select value={formData.cantidad} onValueChange={(value) => setFormData((prev) => ({ ...prev, cantidad: value }))}>
                    <SelectTrigger className="h-11 bg-[#0b1328] border-white/10 text-slate-100 focus-visible:ring-indigo-400">
                      <SelectValue placeholder="Seleccionar volumen" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0b1328] border-white/10 text-slate-100">
                      {VOLUME_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Etapa de compra *</Label>
                  <Select value={formData.etapa} onValueChange={(value) => setFormData((prev) => ({ ...prev, etapa: value }))}>
                    <SelectTrigger className="h-11 bg-[#0b1328] border-white/10 text-slate-100 focus-visible:ring-indigo-400">
                      <SelectValue placeholder="Seleccionar etapa de compra" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0b1328] border-white/10 text-slate-100">
                      {PURCHASE_STAGE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Label htmlFor={`lead-comentarios-${lead.id}`}>Comentarios del cliente</Label>
                <Textarea
                  id={`lead-comentarios-${lead.id}`}
                  value={formData.comentarios}
                  onChange={(event) => setFormData((prev) => ({ ...prev, comentarios: event.target.value }))}
                  className="min-h-[96px] bg-[#0b1328] border-white/10 text-slate-100 focus-visible:ring-indigo-400"
                />
              </div>
            </div>

            <div className="bg-[#0f1a34] border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-slate-100 mb-4">Acciones rápidas</h3>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => onCall?.(lead)} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3">
                  <Phone className="h-4 w-4 mr-2" />
                  Llamar
                </Button>
                <Button onClick={() => onWhatsApp?.(lead)} className="bg-green-500 hover:bg-green-600 text-white px-6 py-3">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
                {lead.email ? (
                  <Button onClick={() => onEmail?.(lead)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3">
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                ) : null}
                {onUpdateLead ? (
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="ml-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Guardando...' : 'Guardar cambios'}
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
} 