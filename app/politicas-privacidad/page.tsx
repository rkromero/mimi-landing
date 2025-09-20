"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Shield, Eye, Lock, UserCheck, FileText, Mail, Phone } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PoliticasPrivacidad() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-orange-50 py-4 px-4 border-b border-gray-100 sticky top-0 z-40 backdrop-blur-sm">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <img
                src="/images/mimi-logo-new.png"
                alt="MIMI Alfajores"
                className="h-12 w-auto"
                style={{ 
                  maxWidth: '120px',
                  filter: "brightness(0) saturate(100%) invert(45%) sepia(89%) saturate(1000%) hue-rotate(346deg) brightness(95%) contrast(95%)"
                }}
              />
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm" className="text-[#E65C37] border-[#E65C37] hover:bg-[#E65C37] hover:text-white">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al inicio
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-4 bg-gradient-to-br from-white via-orange-50 to-cyan-50">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <Badge className="bg-[#E65C37] text-white mb-4 px-6 py-2 text-sm font-semibold">
              <Shield className="mr-2 h-4 w-4" />
              Protección de Datos
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Política de <span className="text-[#E65C37]">Privacidad</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              En MIMI Alfajores respetamos tu privacidad y protegemos tus datos personales conforme a la legislación argentina.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Última actualización: {new Date().toLocaleDateString('es-AR')}
            </p>
          </div>
        </div>
      </section>

      {/* Contenido Principal */}
      <section className="py-12 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-8">
            
            {/* Información General */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-[#E65C37] flex items-center">
                  <FileText className="mr-3 h-6 w-6" />
                  Información General
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  <strong>MIMI Alfajores</strong> (en adelante "la Empresa", "nosotros" o "nuestro") se compromete a proteger la privacidad y los datos personales de nuestros usuarios, distribuidores y visitantes de nuestro sitio web.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Esta Política de Privacidad describe cómo recopilamos, utilizamos, almacenamos y protegemos tu información personal cuando utilizas nuestro sitio web, servicios o te comunicas con nosotros.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Al utilizar nuestros servicios, aceptas las prácticas descritas en esta política de privacidad.
                </p>
              </CardContent>
            </Card>

            {/* Datos que Recopilamos */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-[#E65C37] flex items-center">
                  <Eye className="mr-3 h-6 w-6" />
                  Datos que Recopilamos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Información de Contacto:</h4>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                      <li>Nombre y apellido</li>
                      <li>Dirección de correo electrónico</li>
                      <li>Número de teléfono y WhatsApp</li>
                      <li>Dirección física</li>
                      <li>Información del negocio (nombre, tipo, ubicación)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Información Técnica:</h4>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                      <li>Dirección IP</li>
                      <li>Tipo de navegador y dispositivo</li>
                      <li>Páginas visitadas y tiempo de navegación</li>
                      <li>Cookies y tecnologías similares</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Información Comercial:</h4>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                      <li>Historial de pedidos y compras</li>
                      <li>Preferencias de productos</li>
                      <li>Comunicaciones y consultas</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cómo Utilizamos tus Datos */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-[#E65C37] flex items-center">
                  <UserCheck className="mr-3 h-6 w-6" />
                  Cómo Utilizamos tus Datos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Finalidades Principales:</h4>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                      <li>Procesar y gestionar tus pedidos</li>
                      <li>Proporcionar atención al cliente</li>
                      <li>Enviar información comercial y promocional</li>
                      <li>Mejorar nuestros productos y servicios</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Finalidades Secundarias:</h4>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                      <li>Análisis estadísticos y de mercado</li>
                      <li>Seguridad y prevención de fraudes</li>
                      <li>Cumplimiento de obligaciones legales</li>
                      <li>Comunicaciones administrativas</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Protección de Datos */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-[#E65C37] flex items-center">
                  <Lock className="mr-3 h-6 w-6" />
                  Protección y Seguridad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Implementamos medidas técnicas y organizativas apropiadas para proteger tus datos personales contra:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Acceso no autorizado</li>
                  <li>Alteración, divulgación o destrucción</li>
                  <li>Pérdida accidental</li>
                  <li>Procesamiento ilícito</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  Utilizamos tecnologías de encriptación, servidores seguros y protocolos de seguridad actualizados para proteger tu información.
                </p>
              </CardContent>
            </Card>

            {/* Compartir Información */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-[#E65C37]">Compartir Información</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  No vendemos, alquilamos ni compartimos tu información personal con terceros, excepto en los siguientes casos:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Con tu consentimiento explícito</li>
                  <li>Para cumplir con obligaciones legales</li>
                  <li>Con proveedores de servicios que nos ayudan a operar nuestro negocio (bajo acuerdos de confidencialidad)</li>
                  <li>En caso de fusión, adquisición o venta de activos</li>
                </ul>
              </CardContent>
            </Card>

            {/* Tus Derechos */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-[#E65C37]">Tus Derechos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Conforme a la Ley N° 25.326 de Protección de Datos Personales de Argentina, tienes derecho a:
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Acceder a tus datos personales</li>
                    <li>Rectificar información inexacta</li>
                    <li>Solicitar la supresión de tus datos</li>
                    <li>Oponerte al tratamiento</li>
                  </ul>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Revocar tu consentimiento</li>
                    <li>Portabilidad de datos</li>
                    <li>No ser objeto de decisiones automatizadas</li>
                    <li>Presentar reclamos ante la AAIP</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Cookies */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-[#E65C37]">Cookies y Tecnologías Similares</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Utilizamos cookies y tecnologías similares para mejorar tu experiencia en nuestro sitio web. Las cookies nos ayudan a:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Recordar tus preferencias</li>
                  <li>Analizar el tráfico del sitio</li>
                  <li>Personalizar el contenido</li>
                  <li>Mejorar la funcionalidad</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  Puedes configurar tu navegador para rechazar cookies, aunque esto puede afectar la funcionalidad del sitio.
                </p>
              </CardContent>
            </Card>

            {/* Retención de Datos */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-[#E65C37]">Retención de Datos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Conservamos tus datos personales durante el tiempo necesario para cumplir con las finalidades descritas en esta política, o según lo requiera la legislación aplicable.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Los datos de clientes activos se conservan mientras mantengas una relación comercial con nosotros. Los datos de marketing se conservan hasta que retires tu consentimiento.
                </p>
              </CardContent>
            </Card>

            {/* Menores de Edad */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-[#E65C37]">Menores de Edad</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Nuestros servicios están dirigidos a personas mayores de 18 años. No recopilamos intencionalmente información personal de menores de edad.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Si descubrimos que hemos recopilado información de un menor sin el consentimiento de sus padres, tomaremos medidas para eliminar dicha información.
                </p>
              </CardContent>
            </Card>

            {/* Cambios en la Política */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-[#E65C37]">Cambios en esta Política</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Podemos actualizar esta Política de Privacidad ocasionalmente. Te notificaremos sobre cambios significativos a través de:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Notificación en nuestro sitio web</li>
                  <li>Correo electrónico</li>
                  <li>Otros medios de comunicación apropiados</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  Te recomendamos revisar esta política periódicamente para mantenerte informado sobre cómo protegemos tu información.
                </p>
              </CardContent>
            </Card>

            {/* Contacto */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-[#E65C37]/5 to-[#66CCDA]/5">
              <CardHeader>
                <CardTitle className="text-2xl text-[#E65C37] flex items-center">
                  <Mail className="mr-3 h-6 w-6" />
                  Contacto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Si tienes preguntas sobre esta Política de Privacidad o deseas ejercer tus derechos, puedes contactarnos:
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-[#E65C37] mr-3" />
                      <span className="text-gray-700">ventas@alfajoresmimi.com</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-[#E65C37] mr-3" />
                      <span className="text-gray-700">+54 9 11 7363-9684</span>
                    </div>
                  </div>
                  <div className="text-gray-700">
                    <p><strong>Dirección:</strong> Buenos Aires, Argentina</p>
                    <p><strong>Horario de atención:</strong> Lunes a Viernes de 9:00 a 18:00 hs</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  Nos comprometemos a responder a tus consultas en un plazo máximo de 10 días hábiles.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="border-t border-gray-800 pt-8">
            <p className="text-gray-400">
              &copy; 2025 MIMI Alfajores. Todos los derechos reservados. Industria Argentina.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Esta política cumple con la Ley N° 25.326 de Protección de Datos Personales de Argentina
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
