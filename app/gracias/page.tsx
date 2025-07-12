"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  CheckCircle,
  MessageCircle,
  Phone,
  Mail,
  Instagram,
  Facebook,
  TrendingUp,
  Star,
  Award,
  Users,
  Truck,
  Clock,
  ArrowRight,
  Heart
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect } from "react"
import { useGoogleAds } from "@/hooks/use-google-ads"

export default function GraciasPage() {
  const { trackSectionView, trackWhatsAppClick, trackPhoneClick, trackEmailClick } = useGoogleAds()
  
  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0)
    
    // Track page view de agradecimiento
    trackSectionView('thank-you-page')
    
    // Track conversion completion
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'conversion_complete', {
        event_category: 'Lead Generation',
        event_label: 'Thank You Page View',
        value: 1
      })
    }
    
    // Track Meta Pixel thank you page
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'CompleteRegistration', {
        content_name: 'Distribuidor Registration Complete',
        content_category: 'Thank You Page'
      })
    }
  }, [trackSectionView])

  const handleWhatsAppClick = () => {
    const phoneNumber = "5491173639684"
    const message = "¡Hola! Acabo de completar el formulario para ser distribuidor de MIMI. ¿Cuándo podemos hablar?"
    const encodedMessage = encodeURIComponent(message)
    
    // Track WhatsApp click from thank you page
    trackWhatsAppClick(phoneNumber)
    
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank')
  }
  
  const handlePhoneClick = () => {
    trackPhoneClick("+5491173639684")
    window.open('tel:+5491173639684')
  }
  
  const handleEmailClick = () => {
    trackEmailClick("ventas@mimialfajor.com.ar")
    window.open('mailto:ventas@mimialfajor.com.ar?subject=Consulta%20Distribuidor%20MIMI')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Header */}
      <header className="bg-white py-4 px-4 border-b border-gray-100 sticky top-0 z-40 backdrop-blur-sm">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-center">
            <img
              src="/images/mimi-logo-new.png"
              alt="MIMI Alfajores"
              className="h-12 w-auto"
              style={{ maxWidth: '150px' }}
            />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section de Agradecimiento */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            ¡Gracias por tu interés!
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Hemos recibido tu solicitud para ser distribuidor de <span className="text-[#E65C37] font-semibold">MIMI Alfajores</span>. 
            Nuestro equipo se pondrá en contacto contigo en las próximas <span className="font-semibold">24 horas</span>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleWhatsAppClick}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-semibold"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Escribinos por WhatsApp
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="border-[#E65C37] text-[#E65C37] hover:bg-[#E65C37] hover:text-white px-8 py-4 text-lg font-semibold"
              onClick={handlePhoneClick}
            >
              <Phone className="mr-2 h-5 w-5" />
              Llamanos ahora
            </Button>
          </div>
        </div>

        {/* Sección Inspiracional */}
        <div className="bg-gradient-to-r from-[#E65C37] to-orange-500 text-white rounded-2xl p-8 mb-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <TrendingUp className="w-12 h-12 text-orange-100" />
            </div>
            <h2 className="text-3xl font-bold mb-4">
              ¡Prepárate para el éxito!
            </h2>
            <p className="text-xl mb-6 text-orange-100">
              Estás a punto de unirte a una red de distribuidores exitosos que están 
              <span className="font-bold text-white"> transformando sus negocios</span> con MIMI.
            </p>
            <div className="bg-white/20 rounded-xl p-6 backdrop-blur-sm">
              <p className="text-lg font-semibold mb-2">
                "El éxito no es casualidad. Es trabajo duro, perseverancia, aprendizaje y sacrificio."
              </p>
              <p className="text-orange-100">
                - Pelé
              </p>
            </div>
          </div>
        </div>

        {/* Qué sigue ahora */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            ¿Qué sigue ahora?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center border-2 border-orange-100 hover:border-[#E65C37] transition-all duration-300">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-[#E65C37] rounded-full flex items-center justify-center">
                    <Clock className="w-8 h-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-[#E65C37]">
                  Próximas 24 horas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Nuestro equipo comercial se pondrá en contacto contigo para conocer más sobre tu negocio y tus objetivos.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-orange-100 hover:border-[#E65C37] transition-all duration-300">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-[#E65C37] rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-[#E65C37]">
                  Primera reunión
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Coordinaremos una videollamada para explicarte toda la propuesta, condiciones y beneficios exclusivos.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-orange-100 hover:border-[#E65C37] transition-all duration-300">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-[#E65C37] rounded-full flex items-center justify-center">
                    <Truck className="w-8 h-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-[#E65C37]">
                  ¡Comienza a vender!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Recibirás tu primer pedido y comenzarás a generar ingresos con los alfajores premium más buscados.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Testimonios de motivación */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Distribuidores que ya están triunfando
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-[#E65C37] rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900">María González</h3>
                  <p className="text-sm text-gray-600">Kiosco Las Flores - CABA</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "En 3 meses tripliqué las ventas de alfajores. Los clientes preguntan específicamente por MIMI. 
                ¡Es increíble cómo el packaging llama la atención!"
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-[#E65C37] rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900">Carlos Pérez</h3>
                  <p className="text-sm text-gray-600">Distribuidora Norte - Rosario</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "Comenzé con 24 docenas al mes y ahora manejo más de 200. El soporte de MIMI es excepcional, 
                siempre están cuando los necesito."
              </p>
            </div>
          </div>
        </div>

        {/* Contacto directo */}
        <div className="bg-white rounded-2xl p-8 border-2 border-orange-100">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
            ¿Tenés alguna pregunta?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">WhatsApp</h3>
              <p className="text-sm text-gray-600 mb-3">Respuesta inmediata</p>
              <Button
                onClick={handleWhatsAppClick}
                variant="outline"
                size="sm"
                className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
              >
                Escribir
              </Button>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Teléfono</h3>
              <p className="text-sm text-gray-600 mb-3">+54 11 7363-9684</p>
              <Button
                onClick={handlePhoneClick}
                variant="outline"
                size="sm"
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
              >
                Llamar
              </Button>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
              <p className="text-sm text-gray-600 mb-3">ventas@mimialfajor.com.ar</p>
              <Button
                onClick={handleEmailClick}
                variant="outline"
                size="sm"
                className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
              >
                Escribir
              </Button>
            </div>
          </div>
        </div>

        {/* Footer con redes sociales */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <div className="flex justify-center space-x-6 mb-6">
            <a href="#" className="text-gray-400 hover:text-[#E65C37] transition-colors">
              <Instagram className="w-6 h-6" />
            </a>
            <a href="#" className="text-gray-400 hover:text-[#E65C37] transition-colors">
              <Facebook className="w-6 h-6" />
            </a>
          </div>
          
          <p className="text-gray-600 mb-4">
            ¡Seguinos en nuestras redes para ver las últimas novedades!
          </p>
          
          <div className="flex justify-center items-center space-x-2 text-[#E65C37]">
            <Heart className="w-5 h-5" />
            <span className="font-semibold">Bienvenido a la familia MIMI</span>
            <Heart className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  )
} 