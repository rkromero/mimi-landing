export interface Lead {
  id: string
  nombre: string
  negocio: string
  provincia: string
  localidad: string
  cantidad: string
  etapa: string
  etapaCrm: string
  whatsapp: string
  email?: string
  comentarios?: string
  notas?: string
  valor?: number
  assignedToId?: string | null
  assignedToName?: string | null
  assignedToEmail?: string | null
  createdAt: string
  updatedAt: string
}

export interface LeadsPorEtapa {
  entrante: Lead[]
  'primer-llamado': Lead[]
  seguimiento: Lead[]
  ganado: Lead[]
  perdido: Lead[]
} 