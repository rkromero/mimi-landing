'use client'

import { FormEvent, useState } from 'react'
import { Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'

interface CreateSellerModalProps {
  onSellerCreated: () => void
}

export function CreateSellerModal({ onSellerCreated }: CreateSellerModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const resetForm = () => {
    setName('')
    setEmail('')
    setPassword('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!name.trim() || !email.trim() || !password) {
      toast({
        title: 'Datos incompletos',
        description: 'Nombre, email y password son obligatorios.',
        variant: 'destructive',
      })
      return
    }

    if (password.length < 10) {
      toast({
        title: 'Password demasiado corto',
        description: 'Usa al menos 10 caracteres.',
        variant: 'destructive',
      })
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'No se pudo crear el vendedor')
      }

      toast({
        title: 'Vendedor creado',
        description: 'El usuario vendedor fue creado correctamente.',
      })
      setOpen(false)
      resetForm()
      onSellerCreated()
    } catch (error) {
      toast({
        title: 'No se pudo crear el vendedor',
        description: error instanceof Error ? error.message : 'Error inesperado',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Crear vendedor
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo vendedor</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="seller-name">Nombre</Label>
            <Input
              id="seller-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="seller-email">Email</Label>
            <Input
              id="seller-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="seller-password">Password temporal</Label>
            <Input
              id="seller-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creando...' : 'Crear vendedor'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
