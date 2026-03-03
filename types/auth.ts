export type CrmRole = 'ADMIN' | 'VENDEDOR'

export interface CrmAuthUser {
  id: string
  email: string
  name: string
  role: CrmRole
}

export interface CrmSeller {
  id: string
  name: string
  email: string
}
