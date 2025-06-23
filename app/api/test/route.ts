import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Test básico sin Prisma
    return NextResponse.json({ 
      status: 'API funcionando',
      timestamp: new Date().toISOString(),
      env: {
        nodeEnv: process.env.NODE_ENV,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 15) + '...'
      }
    })
  } catch (error) {
    console.error('Error en test API:', error)
    return NextResponse.json(
      { error: 'Error en test API', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 