"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import {
  Truck,
  Package,
  TrendingUp,
  Users,
  MapPin,
  Star,
  Phone,
  Mail,
  MessageCircle,
  Instagram,
  Facebook,
  Award,
  DollarSign,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"

export default function MimiLanding() {
  // Estado para el menú móvil
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Estado para el formulario
  const [formData, setFormData] = useState({
    nombre: '',
    negocio: '',
    ubicacion: '',
    cantidad: '',
    etapa: '',
    whatsapp: '',
    email: '',
    comentarios: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  // Función para manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
  }

  // Función para manejar cambios en los selects
  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Función para enviar el formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitMessage('¡Formulario enviado exitosamente! Te contactaremos pronto.')
        setFormData({
          nombre: '',
          negocio: '',
          ubicacion: '',
          cantidad: '',
          etapa: '',
          whatsapp: '',
          email: '',
          comentarios: ''
        })
      } else {
        const errorData = await response.json()
        setSubmitMessage(`Error: ${errorData.error}`)
      }
    } catch (error) {
      setSubmitMessage('Error al enviar el formulario. Por favor, intenta nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Función para manejar el scroll suave
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault()
    const href = e.currentTarget.getAttribute("href")
    if (!href?.startsWith("#")) return

    const targetId = href.replace("#", "")
    const element = document.getElementById(targetId)
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100, // Offset para que no quede justo en el borde
        behavior: "smooth",
      })
    }
  }

  // Configurar el scroll suave para todos los enlaces internos
  useEffect(() => {
    const internalLinks = document.querySelectorAll('a[href^="#"]')
    internalLinks.forEach((link) => {
      link.addEventListener("click", handleSmoothScroll as unknown as EventListener)
    })

    return () => {
      internalLinks.forEach((link) => {
        link.removeEventListener("click", handleSmoothScroll as unknown as EventListener)
      })
    }
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Logo and Navigation */}
      <header className="bg-orange-50 py-1 px-4 border-b border-gray-100 sticky top-0 z-40 backdrop-blur-sm h-16">
        <div className="container mx-auto max-w-7xl h-full">
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <div className="flex justify-center lg:justify-start">
              <Image
                src="/images/mimi-logo-new.png"
                alt="MIMI - Alfajores Premium Argentinos"
                width={100}
                height={40}
                className="h-24 w-auto max-h-24"
                priority={true}
                style={{
                  filter:
                    "brightness(0) saturate(100%) invert(45%) sepia(89%) saturate(1000%) hue-rotate(346deg) brightness(95%) contrast(95%)",
                  width: "auto",
                  height: "auto",
                }}
              />
            </div>

            {/* Navigation Menu - Desktop */}
            <nav className="hidden lg:flex items-center space-x-4">
              <a
                href="#beneficios"
                className="text-gray-700 hover:text-[#E65C37] text-sm font-medium transition-colors duration-200"
                onClick={handleSmoothScroll}
              >
                Beneficios
              </a>
              <a
                href="#productos"
                className="text-gray-700 hover:text-[#E65C37] text-sm font-medium transition-colors duration-200"
                onClick={handleSmoothScroll}
              >
                Productos
              </a>
              <a
                href="#testimonios"
                className="text-gray-700 hover:text-[#E65C37] text-sm font-medium transition-colors duration-200"
                onClick={handleSmoothScroll}
              >
                Testimonios
              </a>
              <a
                href="#contacto"
                className="text-gray-700 hover:text-[#E65C37] text-sm font-medium transition-colors duration-200"
                onClick={handleSmoothScroll}
              >
                Contacto
              </a>
              <a
                href="#faq"
                className="text-gray-700 hover:text-[#E65C37] text-sm font-medium transition-colors duration-200"
                onClick={handleSmoothScroll}
              >
                FAQ
              </a>
              <Link
                href="/crm"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200 bg-blue-50 px-3 py-1 rounded-full"
              >
                🎯 CRM
              </Link>
              <Button
                size="sm"
                className="bg-[#E65C37] hover:bg-[#E65C37]/90 text-white px-3 py-1 text-xs font-semibold h-7"
                onClick={(e) => {
                  e.preventDefault()
                  const contactForm = document.getElementById("contacto")
                  if (contactForm) {
                    window.scrollTo({
                      top: contactForm.offsetTop - 100,
                      behavior: "smooth",
                    })
                  }
                }}
              >
                <MessageCircle className="mr-1 h-3 w-3" />
                Contactar
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-1 text-gray-700 hover:text-[#E65C37] transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>


              </header>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            {/* Menu Panel */}
            <div className="lg:hidden fixed top-0 left-0 w-80 h-full bg-white shadow-2xl z-[60] transform transition-transform duration-300">
              {/* Header */}
              <div className="flex items-center justify-center p-2 bg-orange-50 border-b">
                <Image
                  src="/images/mimi-logo-new.png"
                  alt="MIMI"
                  width={60}
                  height={24}
                  className="h-5 w-auto"
                  style={{
                    filter: "brightness(0) saturate(100%) invert(45%) sepia(89%) saturate(1000%) hue-rotate(346deg) brightness(95%) contrast(95%)",
                    width: "auto",
                    height: "auto",
                  }}
                />
              </div>

              {/* Menu Items */}
              <nav className="p-4 space-y-2">
                <a
                  href="#beneficios"
                  className="block px-4 py-3 text-gray-700 hover:text-[#E65C37] hover:bg-orange-50 rounded-lg font-medium transition-colors"
                  onClick={(e) => {
                    handleSmoothScroll(e)
                    setIsMobileMenuOpen(false)
                  }}
                >
                  Beneficios
                </a>
                <a
                  href="#productos"
                  className="block px-4 py-3 text-gray-700 hover:text-[#E65C37] hover:bg-orange-50 rounded-lg font-medium transition-colors"
                  onClick={(e) => {
                    handleSmoothScroll(e)
                    setIsMobileMenuOpen(false)
                  }}
                >
                  Productos
                </a>
                <a
                  href="#testimonios"
                  className="block px-4 py-3 text-gray-700 hover:text-[#E65C37] hover:bg-orange-50 rounded-lg font-medium transition-colors"
                  onClick={(e) => {
                    handleSmoothScroll(e)
                    setIsMobileMenuOpen(false)
                  }}
                >
                  Testimonios
                </a>
                <a
                  href="#contacto"
                  className="block px-4 py-3 text-gray-700 hover:text-[#E65C37] hover:bg-orange-50 rounded-lg font-medium transition-colors"
                  onClick={(e) => {
                    handleSmoothScroll(e)
                    setIsMobileMenuOpen(false)
                  }}
                >
                  Contacto
                </a>
                <a
                  href="#faq"
                  className="block px-4 py-3 text-gray-700 hover:text-[#E65C37] hover:bg-orange-50 rounded-lg font-medium transition-colors"
                  onClick={(e) => {
                    handleSmoothScroll(e)
                    setIsMobileMenuOpen(false)
                  }}
                >
                  FAQ
                </a>
              </nav>

              {/* CTA Button */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-50 border-t">
                <Button
                  className="w-full bg-[#E65C37] hover:bg-[#E65C37]/90 text-white font-semibold py-3"
                  onClick={(e) => {
                    e.preventDefault()
                    const contactForm = document.getElementById("contacto")
                    if (contactForm) {
                      window.scrollTo({
                        top: contactForm.offsetTop - 100,
                        behavior: "smooth",
                      })
                    }
                    setIsMobileMenuOpen(false)
                  }}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Contactar
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-white via-orange-50 to-cyan-50 py-6 px-4 overflow-hidden">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-[#E65C37] text-white hover:bg-[#E65C37]/90">Alfajores Premium Argentinos</Badge>
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                  Alfajores premium para tu negocio. <span className="text-[#E65C37]">Alta rotación.</span>{" "}
                  <span className="text-[#66CCDA]">Alta ganancia.</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Distribuí Mimi: sabor irresistible, packaging llamativo y márgenes desde el 30%.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-[#E65C37] hover:bg-[#E65C37]/90 text-white px-8 py-4 text-lg font-semibold"
                  onClick={(e) => {
                    e.preventDefault()
                    const contactForm = document.getElementById("contacto")
                    if (contactForm) {
                      window.scrollTo({
                        top: contactForm.offsetTop - 100,
                        behavior: "smooth",
                      })
                    }
                  }}
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Quiero vender Mimi
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-[#66CCDA] text-[#66CCDA] hover:bg-[#66CCDA] hover:text-white px-8 py-4 text-lg"
                  onClick={(e) => {
                    e.preventDefault()
                    const productosSection = document.getElementById("productos")
                    if (productosSection) {
                      window.scrollTo({
                        top: productosSection.offsetTop - 100,
                        behavior: "smooth",
                      })
                    }
                  }}
                >
                  Ver catálogo
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#E65C37]">30%+</div>
                  <div className="text-sm text-gray-600">Margen de ganancia</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#66CCDA]">24</div>
                  <div className="text-sm text-gray-600">Docenas pedido mínimo</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">48h</div>
                  <div className="text-sm text-gray-600">Despacho rápido</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-6">
                <div className="transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <Image
                    src="/images/alfajor-chocolate-blanco.jpg"
                    alt="Alfajor Mimi Chocolate Blanco - Packaging premium turquesa"
                    width={300}
                    height={400}
                    className="rounded-2xl shadow-2xl"
                  />
                  <div className="absolute -bottom-4 left-4 bg-white rounded-full px-4 py-2 shadow-lg">
                    <span className="text-sm font-semibold text-[#E65C37]">Chocolate Blanco</span>
                  </div>
                </div>
                <div className="transform -rotate-3 hover:rotate-0 transition-transform duration-300 mt-8">
                  <Image
                    src="/images/alfajor-chocolate-negro.jpg"
                    alt="Alfajor Mimi Chocolate Negro - Packaging premium rojo"
                    width={300}
                    height={400}
                    className="rounded-2xl shadow-2xl"
                  />
                  <div className="absolute -bottom-4 right-4 bg-white rounded-full px-4 py-2 shadow-lg">
                    <span className="text-sm font-semibold text-[#66CCDA]">Chocolate Negro</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Beneficios Section */}
      <section id="beneficios" className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir <span className="text-[#E65C37]">MIMI</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Trabajamos con distribuidores que buscan productos premium con alta rotación y excelentes márgenes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-[#E65C37]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-[#E65C37]" />
                </div>
                <CardTitle className="text-xl">Pedido mínimo bajo</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Comenzá con solo 24 docenas. Perfecto para probar el producto en tu negocio.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-[#66CCDA]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-8 w-8 text-[#66CCDA]" />
                </div>
                <CardTitle className="text-xl">Entregas rápidas</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Envíos a todo el país en 48-72hs. Enviamos por el trasporte que nos indiques.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-[#E65C37]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-[#E65C37]" />
                </div>
                <CardTitle className="text-xl">Packaging que vende</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Diseño disruptivo que atrae la mirada y genera compra por impulso en góndola.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-[#66CCDA]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-[#66CCDA]" />
                </div>
                <CardTitle className="text-xl">Atención personalizada</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Equipo comercial dedicado para acompañarte en el crecimiento de tu negocio.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-[#E65C37]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-8 w-8 text-[#E65C37]" />
                </div>
                <CardTitle className="text-xl">Precios escalonados</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">Mejores precios por volumen. Cuanto más vendés, más ganás.</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-[#66CCDA]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-[#66CCDA]" />
                </div>
                <CardTitle className="text-xl">Industria Argentina</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Producto 100% nacional con la calidad y tradición de los alfajores argentinos.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Productos Section */}
      <section id="productos" className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nuestros <span className="text-[#E65C37]">Alfajores</span> Premium
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Dos variedades irresistibles que conquistan todos los paladares
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="text-center group">
              <div className="relative mb-8">
                <Image
                  src="/images/alfajor-blanco-producto.jpg"
                  alt="Alfajor Mimi Chocolate Blanco - Dulce de leche artesanal cubierto con chocolate blanco premium"
                  width={400}
                  height={400}
                  className="mx-auto rounded-3xl shadow-2xl group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute -top-4 -right-4 bg-[#E65C37] text-white rounded-full px-4 py-2 font-semibold">
                  ¡El mejor chocolate blanco!
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Chocolate Blanco</h3>
              <p className="text-gray-600 mb-6">
                Dulce de leche artesanal cubierto con chocolate blanco premium. Textura cremosa y sabor equilibrado que
                enamora desde el primer bocado.
              </p>
              <div className="flex justify-center gap-4">
                <Badge variant="outline" className="border-[#E65C37] text-[#E65C37]">
                  Blanco
                </Badge>
                <Badge variant="outline" className="border-[#66CCDA] text-[#66CCDA]">
                  60 gr
                </Badge>
              </div>
            </div>

            <div className="text-center group">
              <div className="relative mb-8">
                <Image
                  src="/images/alfajor-negro-producto.jpg"
                  alt="Alfajor Mimi Chocolate Negro - Dulce de leche tradicional envuelto en chocolate semi-amargo"
                  width={400}
                  height={400}
                  className="mx-auto rounded-3xl shadow-2xl group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute -top-4 -right-4 bg-[#E65C37] text-white rounded-full px-4 py-2 font-semibold">
                ¡El mas vendido!
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Chocolate Negro</h3>
              <p className="text-gray-600 mb-6">
                Dulce de leche tradicional envuelto en chocolate semi-amargo de origen. Para paladares exigentes que
                buscan la combinación perfecta.
              </p>
              <div className="flex justify-center gap-4">
                <Badge variant="outline" className="border-[#E65C37] text-[#E65C37]">
                  Chocolate Semi-amargo
                </Badge>
                <Badge variant="outline" className="border-[#66CCDA] text-[#66CCDA]">
                  60 gramos
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonios Section */}
      <section
        id="testimonios"
        className="py-20 px-4 bg-gradient-to-br from-[#E65C37]/5 via-white to-[#66CCDA]/5 relative overflow-hidden"
      >
        {/* Elementos decorativos de fondo */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-[#E65C37]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-[#66CCDA]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-[#E65C37]/5 to-[#66CCDA]/5 rounded-full blur-3xl"></div>

        <div className="container mx-auto max-w-7xl relative">
          <div className="text-center mb-16">
            <Badge className="bg-[#E65C37] text-white mb-4 px-6 py-2 text-sm font-semibold">
              ⭐ Testimonios Verificados
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Lo que dicen nuestros <span className="text-[#E65C37]">distribuidores</span>
              <br />
              <span className="text-2xl md:text-3xl text-gray-600 font-normal">en Google Reviews</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Más de 500 distribuidores confían en MIMI. Lee sus experiencias reales.
            </p>
          </div>

          {/* Grid de 3 testimonios estilo Google Reviews */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Testimonio 1 */}
            <Card className="border-0 shadow-xl bg-white relative overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-6">
                {/* Header estilo Google */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="font-semibold text-gray-700">Google</span>
                  </div>
                  <Badge variant="outline" className="text-xs border-green-500 text-green-600">
                    ✓ Verificado
                  </Badge>
                </div>

                {/* Estrellas */}
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Testimonio */}
                <blockquote className="text-gray-700 leading-relaxed mb-6 font-medium">
                  "Los alfajores Mimi se venden solos. El packaging llama la atención y la calidad es excelente. Mis
                  clientes siempre vuelven a pedirlos. En 6 meses aumenté mis ventas un 40%."
                </blockquote>

                {/* Autor */}
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#E65C37] to-[#E65C37]/80 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    MR
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">María Rodriguez</div>
                    <div className="text-gray-500 text-sm">Kiosco Central - Córdoba</div>
                    <div className="text-xs text-gray-400 mt-1">Hace 2 semanas</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonio 2 */}
            <Card className="border-0 shadow-xl bg-white relative overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-6">
                {/* Header estilo Google */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="font-semibold text-gray-700">Google</span>
                  </div>
                  <Badge variant="outline" className="text-xs border-green-500 text-green-600">
                    ✓ Verificado
                  </Badge>
                </div>

                {/* Estrellas */}
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Testimonio */}
                <blockquote className="text-gray-700 leading-relaxed mb-6 font-medium">
                  "Trabajo con Mimi hace 2 años. Excelente atención, entregas puntuales y un producto que realmente
                  genera buenos márgenes. Lo recomiendo 100%."
                </blockquote>

                {/* Autor */}
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#66CCDA] to-[#66CCDA]/80 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    CL
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Carlos López</div>
                    <div className="text-gray-500 text-sm">Distribuidora Norte - Rosario</div>
                    <div className="text-xs text-gray-400 mt-1">Hace 1 mes</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonio 3 */}
            <Card className="border-0 shadow-xl bg-white relative overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-6">
                {/* Header estilo Google */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="font-semibold text-gray-700">Google</span>
                  </div>
                  <Badge variant="outline" className="text-xs border-green-500 text-green-600">
                    ✓ Verificado
                  </Badge>
                </div>

                {/* Estrellas */}
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Testimonio */}
                <blockquote className="text-gray-700 leading-relaxed mb-6 font-medium">
                  "La diferencia con otros alfajores es notable. Mimi tiene ese packaging disruptivo y mucho relleno que es lo que buscan mis clientes.
                  Rotación constante y buena rentabilidad."
                </blockquote>

                {/* Autor */}
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#E65C37] to-[#66CCDA] rounded-full flex items-center justify-center text-white font-bold mr-4">
                    AG
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Ana García</div>
                    <div className="text-gray-500 text-sm">Almacén Gourmet - CABA</div>
                    <div className="text-xs text-gray-400 mt-1">Hace 3 semanas</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Estadísticas de confianza - Actualizada sin "2 años" */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
              <div className="text-4xl font-bold text-[#E65C37] mb-3">500+</div>
              <div className="text-gray-600 font-medium">Distribuidores activos</div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
              <div className="text-4xl font-bold text-[#66CCDA] mb-3">4.9★</div>
              <div className="text-gray-600 font-medium">Rating promedio Google</div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
              <div className="text-4xl font-bold text-[#E65C37] mb-3">24hs</div>
              <div className="text-gray-600 font-medium">Tiempo de respuesta</div>
            </div>
          </div>

          {/* CTA mejorado */}
          <div className="text-center bg-gradient-to-r from-[#E65C37]/10 to-[#66CCDA]/10 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              ¿Querés ser parte de nuestra red de distribuidores exitosos?
            </h3>
            <p className="text-lg text-gray-600 mb-6">Únete a más de 500 distribuidores que ya confían en MIMI</p>
            <div className="flex justify-center">
              <Button
                size="lg"
                className="bg-[#E65C37] hover:bg-[#E65C37]/90 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
                onClick={(e) => {
                  e.preventDefault()
                  const contactForm = document.getElementById("contacto")
                  if (contactForm) {
                    window.scrollTo({
                      top: contactForm.offsetTop - 100,
                      behavior: "smooth",
                    })
                  }
                }}
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Comenzar ahora
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Formulario Section */}
      <section id="contacto" className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Solicitá tu <span className="text-[#E65C37]">catálogo mayorista</span>
            </h2>
            <p className="text-xl text-gray-600">
              Completá el formulario y recibí toda la información comercial en menos de 24hs
            </p>
          </div>

          <Card className="shadow-2xl border-0">
            <CardContent className="p-8">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre y Apellido *</Label>
                    <Input 
                      id="nombre" 
                      placeholder="Tu nombre completo" 
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
                    <Label htmlFor="ubicacion">Provincia/Localidad *</Label>
                    <Input 
                      id="ubicacion" 
                      placeholder="¿Dónde está ubicado?" 
                      className="h-12"
                      value={formData.ubicacion}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cantidad">Cantidad estimada mensual</Label>
                    <Select value={formData.cantidad} onValueChange={(value) => handleSelectChange('cantidad', value)}>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="etapa">¿En qué etapa te encontrás respecto a la compra? *</Label>
                  <Select value={formData.etapa} onValueChange={(value) => handleSelectChange('etapa', value)} required>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Seleccioná tu situación actual" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buscando-opciones">Estoy buscando opciones, sin apuro</SelectItem>
                      <SelectItem value="empezar-pronto">Me interesa empezar pronto</SelectItem>
                      <SelectItem value="listo-primer-pedido">Estoy listo para hacer mi primer pedido</SelectItem>
                      <SelectItem value="busco-mejor-proveedor">Ya vendo alfajores y busco mejor proveedor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp *</Label>
                    <Input 
                      id="whatsapp" 
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
                    placeholder="Contanos sobre tu negocio, experiencia con alfajores, etc."
                    className="min-h-[100px]"
                    value={formData.comentarios}
                    onChange={handleInputChange}
                  />
                </div>

                {submitMessage && (
                  <div className={`p-4 rounded-lg text-center ${
                    submitMessage.includes('exitosamente') 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {submitMessage}
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-[#E65C37] hover:bg-[#E65C37]/90 text-white py-4 text-lg font-semibold"
                  disabled={isSubmitting}
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  {isSubmitting ? 'Enviando...' : 'Quiero recibir info'}
                </Button>

                <p className="text-sm text-gray-500 text-center">
                  * Campos obligatorios. Te contactaremos en menos de 24hs.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Preguntas <span className="text-[#E65C37]">frecuentes</span>
            </h2>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="bg-white rounded-lg px-6 border-0 shadow-sm">
              <AccordionTrigger className="text-left font-semibold">
                ¿Cuál es el pedido mínimo para comenzar?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                El pedido mínimo es de 24 docenas (288 unidades). Podés combinar ambas variedades. Es perfecto para
                probar el producto y ver la aceptación en tu negocio.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="bg-white rounded-lg px-6 border-0 shadow-sm">
              <AccordionTrigger className="text-left font-semibold">¿Cómo son los tiempos de entrega?</AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Realizamos envíos a todo el país. CABA y GBA: 24-48hs. Interior del país: 48-72hs. Despachamos por el trasporte que nos indiques.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="bg-white rounded-lg px-6 border-0 shadow-sm">
              <AccordionTrigger className="text-left font-semibold">
                ¿Qué márgenes de ganancia puedo obtener?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Los márgenes van desde el 20% hasta el 30% dependiendo del volumen de compra. Tenemos precios
                escalonados que premian la fidelidad y el volumen.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="bg-white rounded-lg px-6 border-0 shadow-sm">
              <AccordionTrigger className="text-left font-semibold">¿Cuáles son las formas de pago?</AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Aceptamos transferencia bancaria, efectivo y cheques. Para distribuidores con historial, ofrecemos
                condiciones de pago especiales.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="bg-white rounded-lg px-6 border-0 shadow-sm">
              <AccordionTrigger className="text-left font-semibold">
                ¿Cuál es la vida útil del producto?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Nuestros alfajores tienen una vida útil de 90 días desde la fecha de elaboración. Siempre enviamos
                producto fresco con al menos 60 días de vencimiento.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="bg-white rounded-lg px-6 border-0 shadow-sm">
              <AccordionTrigger className="text-left font-semibold">¿Ofrecen material de marketing?</AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Sí, proporcionamos displays para góndola, carteles promocionales y material gráfico para redes sociales.
                Todo sin costo adicional para nuestros distribuidores.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="text-3xl font-bold text-[#E65C37]">MIMI</div>
              <p className="text-gray-300">
                Alfajores premium argentinos para distribuidores que buscan calidad y rentabilidad.
              </p>
              <div className="flex space-x-4">
                <Link href="#" className="text-gray-300 hover:text-[#E65C37] transition-colors">
                  <Instagram className="h-6 w-6" />
                </Link>
                <Link href="#" className="text-gray-300 hover:text-[#66CCDA] transition-colors">
                  <Facebook className="h-6 w-6" />
                </Link>
                <Link href="#" className="text-gray-300 hover:text-[#E65C37] transition-colors">
                  <MessageCircle className="h-6 w-6" />
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-[#66CCDA]">Contacto</h4>
              <div className="space-y-3 text-gray-300">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-[#E65C37]" />
                  <span>+54 9 11 7363-9684</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-[#E65C37]" />
                  <span>ventas@alfajoresmimi.com</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-[#E65C37]" />
                  <span>Buenos Aires, Argentina</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-[#66CCDA]">Productos</h4>
              <ul className="space-y-2 text-gray-300">
                <li>Alfajor Chocolate Blanco</li>
                <li>Alfajor Chocolate Negro</li>
                <li>Packs Mixtos</li>
                <li>Cajas Mayoristas</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-[#66CCDA]">Información</h4>
              <ul className="space-y-2 text-gray-300">
                <li>Términos y Condiciones</li>
                <li>Política de Privacidad</li>
                <li>Preguntas Frecuentes</li>
                <li>Sobre Nosotros</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 MIMI Alfajores. Todos los derechos reservados. Industria Argentina.</p>
          </div>
        </div>

        {/* WhatsApp Float Button */}
        <Link
          href="https://wa.me/5491173639684"
          className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 z-50"
        >
          <MessageCircle className="h-6 w-6" />
        </Link>
      </footer>
    </div>
  )
}
