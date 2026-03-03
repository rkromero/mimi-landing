'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

const provinciasArgentina = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes',
  'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones',
  'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe',
  'Santiago del Estero', 'Tierra del Fuego', 'Tucumán'
]

interface CreateLeadModalProps {
  onLeadCreated: () => void
  compact?: boolean
  triggerClassName?: string
}

export function CreateLeadModal({ onLeadCreated, compact = false, triggerClassName }: CreateLeadModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    negocio: '',
    provincia: '',
    localidad: '',
    cantidad: '',
    etapa: 'Distribución',
    whatsapp: '',
    email: '',
    comentarios: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validar cantidad mínima
    if (formData.cantidad === 'menos-24') {
      toast({
        title: "Cantidad insuficiente",
        description: "Por el momento trabajamos únicamente con distribuidores y comercios que realizan compras a partir de 24 docenas. Si en el futuro abrimos otras opciones de compra, te lo vamos a avisar con gusto.",
        variant: "destructive"
      })
      return
    }

    // Validar campos obligatorios
    if (!formData.nombre || !formData.negocio || !formData.provincia ||
      !formData.localidad || !formData.cantidad || !formData.whatsapp) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "¡Éxito!",
          description: "Lead creado correctamente en la etapa 'entrante'",
        })
        setOpen(false)
        setFormData({
          nombre: '', negocio: '', provincia: '', localidad: '', cantidad: '',
          etapa: 'Distribución', whatsapp: '', email: '', comentarios: ''
        })
        onLeadCreated() // Recargar la lista de leads
      } else {
        const error = await response.text()
        toast({
          title: "Error",
          description: `Error al crear el lead: ${error}`,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error al crear lead:', error)
      toast({
        title: "Error",
        description: "Error de conexión al crear el lead",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className={cn("bg-green-600 hover:bg-green-700 text-white", triggerClassName)}>
          <Plus className={cn("h-4 w-4", compact ? "" : "mr-2")} />
          {compact ? null : 'Crear Nuevo Lead'}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto bg-[#0b1328] text-slate-100 border-white/10">
        <SheetHeader className="pb-6 border-b border-white/10">
          <SheetTitle className="text-2xl font-bold italic text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-orange rounded-xl flex items-center justify-center">
              <Plus className="h-6 w-6 text-white" />
            </div>
            Crear Nuevo Lead
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-slate-300 ml-1">Nombre *</Label>
              <Input
                id="nombre"
                name="nombre"
                placeholder="Nombre completo"
                className="h-12 bg-[#0f1932] border-slate-700/60 text-slate-100 placeholder:text-slate-500 focus:ring-brand-orange/50 focus:border-brand-orange"
                value={formData.nombre}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="negocio" className="text-slate-300 ml-1">Nombre del Negocio *</Label>
              <Input
                id="negocio"
                name="negocio"
                placeholder="Nombre de tu negocio"
                className="h-12 bg-[#0f1932] border-slate-700/60 text-slate-100 placeholder:text-slate-500 focus:ring-brand-orange/50 focus:border-brand-orange"
                value={formData.negocio}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="provincia" className="text-slate-300 ml-1">Provincia *</Label>
              <Select value={formData.provincia} onValueChange={(value) => handleSelectChange('provincia', value)} required>
                <SelectTrigger className="h-12 bg-[#0f1932] border-slate-700/60 text-slate-100 focus:ring-brand-orange/50">
                  <SelectValue placeholder="Seleccioná tu provincia" />
                </SelectTrigger>
                <SelectContent className="bg-[#0b1328] border-slate-700 text-slate-100">
                  {provinciasArgentina.map((provincia) => (
                    <SelectItem key={provincia} value={provincia}>
                      {provincia}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="localidad" className="text-slate-300 ml-1">Localidad *</Label>
              <Input
                id="localidad"
                name="localidad"
                placeholder="Tu ciudad o localidad"
                className="h-12 bg-[#0f1932] border-slate-700/60 text-slate-100 placeholder:text-slate-500 focus:ring-brand-orange/50 focus:border-brand-orange"
                value={formData.localidad}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cantidad" className="text-slate-300 ml-1">Cantidad estimada mensual *</Label>
            <Select value={formData.cantidad} onValueChange={(value) => handleSelectChange('cantidad', value)} required>
              <SelectTrigger className="h-12 bg-[#0f1932] border-slate-700/60 text-slate-100 focus:ring-brand-orange/50">
                <SelectValue placeholder="Seleccioná tu volumen estimado" />
              </SelectTrigger>
              <SelectContent className="bg-[#0b1328] border-slate-700 text-slate-100">
                <SelectItem value="menos-24">Menos de 24 docenas</SelectItem>
                <SelectItem value="24-100">Entre 24 docenas y 100 docenas</SelectItem>
                <SelectItem value="mas-100">Más de 100 docenas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="text-slate-300 ml-1">WhatsApp *</Label>
              <Input
                id="whatsapp"
                name="whatsapp"
                placeholder="+54 9 11 1234-5678"
                className="h-12 bg-[#0f1932] border-slate-700/60 text-slate-100 placeholder:text-slate-500 focus:ring-brand-orange/50 focus:border-brand-orange"
                value={formData.whatsapp}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300 ml-1">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                className="h-12 bg-[#0f1932] border-slate-700/60 text-slate-100 placeholder:text-slate-500 focus:ring-brand-orange/50 focus:border-brand-orange"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comentarios" className="text-slate-300 ml-1">Comentarios adicionales</Label>
            <Textarea
              id="comentarios"
              name="comentarios"
              placeholder="Información adicional sobre tu consulta..."
              className="min-h-[100px] bg-[#0f1932] border-slate-700/60 text-slate-100 placeholder:text-slate-500 focus:ring-brand-orange/50 focus:border-brand-orange transition-all"
              value={formData.comentarios}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-brand-orange hover:bg-brand-orange/90 text-white font-bold px-8 shadow-lg shadow-brand-orange/20"
            >
              {loading ? 'Creando...' : 'Crear Lead'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
} 