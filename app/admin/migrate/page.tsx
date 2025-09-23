'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function MigratePage() {
  const [isMigrating, setIsMigrating] = useState(false)
  const [migrationResult, setMigrationResult] = useState<{
    success: boolean
    message: string
    updatedCount?: number
  } | null>(null)

  const handleMigration = async () => {
    setIsMigrating(true)
    setMigrationResult(null)

    try {
      const response = await fetch('/api/migrate-cuit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (response.ok) {
        setMigrationResult({
          success: true,
          message: result.message,
          updatedCount: result.updatedCount
        })
      } else {
        setMigrationResult({
          success: false,
          message: result.error || 'Error durante la migración'
        })
      }
    } catch (error) {
      setMigrationResult({
        success: false,
        message: 'Error de conexión durante la migración'
      })
    } finally {
      setIsMigrating(false)
    }
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Migración de CUIT</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              <strong>Importante:</strong> Esta migración actualizará todos los registros existentes 
              que no tienen CUIT con un CUIT temporal. Esto es necesario para hacer el campo 
              obligatorio sin perder datos existentes.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">¿Qué hace esta migración?</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Encuentra todos los registros sin CUIT</li>
              <li>Les asigna un CUIT temporal basado en su ID</li>
              <li>Permite hacer el campo CUIT obligatorio sin perder datos</li>
              <li>Los CUITs temporales deben ser reemplazados por CUITs reales posteriormente</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleMigration}
              disabled={isMigrating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isMigrating ? 'Migrando...' : 'Ejecutar Migración'}
            </Button>
          </div>

          {migrationResult && (
            <div className={`p-4 rounded-lg border ${
              migrationResult.success 
                ? 'border-green-200 bg-green-50 text-green-800' 
                : 'border-red-200 bg-red-50 text-red-800'
            }`}>
              <p>
                <strong>{migrationResult.success ? 'Éxito:' : 'Error:'}</strong> {migrationResult.message}
                {migrationResult.updatedCount && (
                  <div className="mt-2 text-sm">
                    Registros actualizados: <strong>{migrationResult.updatedCount}</strong>
                  </div>
                )}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}