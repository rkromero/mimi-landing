import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CrmRole } from '@prisma/client'
import { requireAuth } from '@/lib/auth'
import * as XLSX from 'xlsx'

const ETAPA_LABELS: Record<string, string> = {
  entrante: 'Leads Entrantes',
  'primer-llamado': 'Primer Llamado',
  seguimiento: 'Hacer Seguimiento',
  '2do-seguimiento': '2do Seguimiento',
  'llamado-final': 'Llamado Final',
  'muestra-enviada': 'Muestra Enviada',
  ganado: 'Lead Ganado',
  perdido: 'Lead Perdido',
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// GET: Exportar todos los leads como Excel
export async function GET(request: NextRequest) {
  try {
    const { auth, error } = await requireAuth(request, [CrmRole.ADMIN, CrmRole.VENDEDOR])
    if (error) return error

    const baseWhere = {
      esBajoVolumen: false,
      ...(auth.user.role === CrmRole.VENDEDOR && { assignedToId: auth.user.id }),
    }

    const leads = await prisma.contactForm.findMany({
      where: baseWhere,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        nombre: true,
        negocio: true,
        provincia: true,
        localidad: true,
        cantidad: true,
        etapa: true,
        etapaCrm: true,
        whatsapp: true,
        email: true,
        comentarios: true,
        notas: true,
        valor: true,
        createdAt: true,
        updatedAt: true,
        assignedTo: {
          select: { name: true, email: true },
        },
      },
    })

    const rows = leads.map((lead) => ({
      'Nombre': lead.nombre,
      'Negocio': lead.negocio,
      'Provincia': lead.provincia || 'No especificada',
      'Localidad': lead.localidad || 'No especificada',
      'WhatsApp': lead.whatsapp,
      'Email': lead.email || '',
      'Cantidad (docenas)': lead.cantidad || '',
      'Etapa formulario': lead.etapa || '',
      'Etapa CRM': ETAPA_LABELS[lead.etapaCrm] ?? lead.etapaCrm,
      'Valor ($)': lead.valor ?? '',
      'Vendedor asignado': lead.assignedTo?.name ?? 'Sin asignar',
      'Email vendedor': lead.assignedTo?.email ?? '',
      'Comentarios': lead.comentarios || '',
      'Notas internas': lead.notas || '',
      'Fecha de ingreso': formatDate(lead.createdAt),
      'Última actualización': formatDate(lead.updatedAt),
    }))

    const worksheet = XLSX.utils.json_to_sheet(rows)

    // Ancho de columnas automático
    const colWidths = [
      { wch: 25 }, // Nombre
      { wch: 30 }, // Negocio
      { wch: 20 }, // Provincia
      { wch: 20 }, // Localidad
      { wch: 18 }, // WhatsApp
      { wch: 28 }, // Email
      { wch: 20 }, // Cantidad
      { wch: 22 }, // Etapa formulario
      { wch: 22 }, // Etapa CRM
      { wch: 14 }, // Valor
      { wch: 25 }, // Vendedor asignado
      { wch: 28 }, // Email vendedor
      { wch: 35 }, // Comentarios
      { wch: 35 }, // Notas internas
      { wch: 20 }, // Fecha ingreso
      { wch: 20 }, // Última actualización
    ]
    worksheet['!cols'] = colWidths

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes')

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    const fecha = new Date().toISOString().slice(0, 10)
    const filename = `mimi-clientes-${fecha}.xlsx`

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error al exportar leads a Excel:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
