"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface ContactForm {
  id: string
  nombre: string
  negocio: string
  ubicacion: string
  cantidad?: string
  etapa: string
  whatsapp: string
  email?: string
  comentarios?: string
  createdAt: string
}

export default function AdminPage() {
  const [forms, setForms] = useState<ContactForm[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchForms()
  }, [])

  const fetchForms = async () => {
    try {
      const response = await fetch('/api/contact')
      if (response.ok) {
        const data = await response.json()
        setForms(data)
      }
    } catch (error) {
      console.error('Error al cargar formularios:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
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

  const getEtapaText = (etapa: string) => {
    switch (etapa) {
      case 'buscando-opciones':
        return 'Buscando opciones'
      case 'empezar-pronto':
        return 'Empezar pronto'
      case 'listo-primer-pedido':
        return 'Listo para pedido'
      case 'busco-mejor-proveedor':
        return 'Busca mejor proveedor'
      default:
        return etapa
    }
  }

  const getCantidadText = (cantidad?: string) => {
    switch (cantidad) {
      case 'menos-24':
        return 'Menos de 24 docenas'
      case '24-100':
        return '24-100 docenas'
      case 'mas-100':
        return 'Más de 100 docenas'
      default:
        return 'No especificado'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Cargando formularios...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Panel de Administración - Formularios de Contacto
          </h1>
          <Button onClick={fetchForms} className="bg-[#E65C37] hover:bg-[#E65C37]/90">
            Actualizar
          </Button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600">
            Total de formularios: <span className="font-semibold">{forms.length}</span>
          </p>
        </div>

        <div className="grid gap-6">
          {forms.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No hay formularios enviados aún.</p>
              </CardContent>
            </Card>
          ) : (
            forms.map((form) => (
              <Card key={form.id} className="shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl text-[#E65C37]">
                      {form.nombre} - {form.negocio}
                    </CardTitle>
                    <Badge className={getEtapaColor(form.etapa)}>
                      {getEtapaText(form.etapa)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    Enviado el {formatDate(form.createdAt)}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-700">Ubicación</h4>
                      <p className="text-gray-600">{form.ubicacion}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700">Cantidad estimada</h4>
                      <p className="text-gray-600">{getCantidadText(form.cantidad)}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-700">WhatsApp</h4>
                      <p className="text-gray-600">
                        <a 
                          href={`https://wa.me/${form.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#E65C37] hover:underline"
                        >
                          {form.whatsapp}
                        </a>
                      </p>
                    </div>
                    {form.email && (
                      <div>
                        <h4 className="font-semibold text-gray-700">Email</h4>
                        <p className="text-gray-600">
                          <a 
                            href={`mailto:${form.email}`}
                            className="text-[#E65C37] hover:underline"
                          >
                            {form.email}
                          </a>
                        </p>
                      </div>
                    )}
                  </div>

                  {form.comentarios && (
                    <div>
                      <h4 className="font-semibold text-gray-700">Comentarios</h4>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {form.comentarios}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
} 