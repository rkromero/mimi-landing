'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

const provinciasArgentina = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes',
  'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones',
  'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe',
  'Santiago del Estero', 'Tierra del Fuego', 'Tucumán'
]

interface CreateLeadModalProps {
  onLeadCreated: () => void
}

export function CreateLeadModal({ onLeadCreated }: CreateLeadModalProps) {
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Crear Nuevo Lead
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Lead</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                name="nombre"
                placeholder="Nombre completo"
                className="h-12"
                value={formData.nombre}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="negocio">Nombre del Negocio *</Label>
              <Input
                id="negocio"
                name="negocio"
                placeholder="Nombre de tu negocio"
                className="h-12"
                value={formData.negocio}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="provincia">Provincia *</Label>
              <Select value={formData.provincia} onValueChange={(value) => handleSelectChange('provincia', value)} required>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Seleccioná tu provincia" />
                </SelectTrigger>
                <SelectContent>
                  {provinciasArgentina.map((provincia) => (
                    <SelectItem key={provincia} value={provincia}>
                      {provincia}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="localidad">Localidad *</Label>
              <Input
                id="localidad"
                name="localidad"
                placeholder="Tu ciudad o localidad"
                className="h-12"
                value={formData.localidad}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cantidad">Cantidad estimada mensual *</Label>
            <Select value={formData.cantidad} onValueChange={(value) => handleSelectChange('cantidad', value)} required>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Seleccioná tu volumen estimado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="menos-24">Menos de 24 docenas</SelectItem>
                <SelectItem value="24-100">Entre 24 docenas y 100 docenas</SelectItem>
                <SelectItem value="mas-100">Más de 100 docenas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp *</Label>
              <Input
                id="whatsapp"
                name="whatsapp"
                placeholder="+54 9 11 1234-5678"
                className="h-12"
                value={formData.whatsapp}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                className="h-12"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comentarios">Comentarios adicionales</Label>
            <Textarea
              id="comentarios"
              name="comentarios"
              placeholder="Información adicional sobre tu consulta..."
              className="min-h-[100px]"
              value={formData.comentarios}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creando...' : 'Crear Lead'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 