import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'
import { createEmailTemplate } from '@/lib/email-template'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Iniciando procesamiento de formulario...')
    
    const body = await request.json()
    console.log('📝 Datos recibidos:', { ...body, whatsapp: body.whatsapp ? '***' : undefined })
    
    const { nombre, negocio, provincia, localidad, cantidad, etapa, whatsapp, cuit, email, comentarios } = body

    // Validar campos obligatorios
    if (!nombre || !negocio || !provincia || !localidad || !cantidad || !etapa || !whatsapp || !cuit) {
      console.log('❌ Faltan campos obligatorios')
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      )
    }

    // Validar formato del CUIT
    const validarCuit = (cuit: string): boolean => {
      const cuitLimpio = cuit.replace(/[-\s]/g, '')
      if (!/^\d{11}$/.test(cuitLimpio)) return false
      
      const multiplicadores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]
      let suma = 0
      for (let i = 0; i < 10; i++) {
        suma += parseInt(cuitLimpio[i]) * multiplicadores[i]
      }
      const resto = suma % 11
      const digitoVerificador = resto < 2 ? resto : 11 - resto
      return digitoVerificador === parseInt(cuitLimpio[10])
    }

    if (!validarCuit(cuit)) {
      console.log('❌ CUIT inválido')
      return NextResponse.json(
        { error: 'El CUIT ingresado no es válido' },
        { status: 400 }
      )
    }

    console.log('🔗 Conectando a la base de datos...')
    
    // Verificar conexión a Prisma
    await prisma.$connect()
    console.log('✅ Conexión a base de datos exitosa')

    // Determinar si es un lead de bajo volumen
    const esBajoVolumen = cantidad === 'menos-24'
    
    // Guardar en la base de datos
    console.log('💾 Guardando en base de datos...')
    const contactForm = await prisma.contactForm.create({
      data: {
        nombre,
        negocio,
        provincia,
        localidad,
        cantidad,
        etapa,
        whatsapp,
        cuit,
        email,
        comentarios,
        esBajoVolumen,
      },
    })

    console.log('✅ Formulario guardado exitosamente:', contactForm.id)
    
    // Enviar email si está configurado
    if (process.env.RESEND_API_KEY && process.env.EMAIL_TO) {
      try {
        console.log('📧 Enviando email...')
        
        const emailHtml = createEmailTemplate({
          nombre: contactForm.nombre,
          negocio: contactForm.negocio,
          provincia: contactForm.provincia,
          localidad: contactForm.localidad,
          cantidad: contactForm.cantidad,
          etapa: contactForm.etapa,
          whatsapp: contactForm.whatsapp,
          cuit: contactForm.cuit,
          email: contactForm.email || undefined,
          comentarios: contactForm.comentarios || undefined,
          createdAt: contactForm.createdAt.toISOString()
        })

        const resend = new Resend(process.env.RESEND_API_KEY)
        const emailResult = await resend.emails.send({
          from: process.env.EMAIL_FROM || 'MIMI Landing <onboarding@resend.dev>',
          to: process.env.EMAIL_TO.split(','),
          subject: `🎯 Nuevo Lead: ${nombre} - ${negocio}`,
          html: emailHtml,
        })

        console.log('✅ Email enviado exitosamente:', emailResult.data?.id)
      } catch (emailError) {
        console.error('❌ Error al enviar email:', emailError)
        // No fallar si el email falla, el formulario ya se guardó
      }
    } else {
      console.log('⚠️ Email no configurado (RESEND_API_KEY o EMAIL_TO faltantes)')
    }
    
    return NextResponse.json(
      { 
        message: 'Formulario enviado exitosamente', 
        id: contactForm.id,
        esBajoVolumen 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('❌ Error detallado al procesar formulario:', error)
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack available')
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET() {
  try {
    const forms = await prisma.contactForm.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(forms)
  } catch (error) {
    console.error('Error al obtener formularios:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 