interface FormData {
  nombre: string
  negocio: string
  ubicacion: string
  cantidad?: string
  etapa: string
  whatsapp: string
  email?: string
  comentarios?: string
  createdAt: string
}

export function createEmailTemplate(data: FormData): string {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEtapaText = (etapa: string) => {
    switch (etapa) {
      case 'buscando-opciones':
        return 'Buscando opciones, sin apuro'
      case 'empezar-pronto':
        return 'Me interesa empezar pronto'
      case 'listo-primer-pedido':
        return 'Estoy listo para hacer mi primer pedido'
      case 'busco-mejor-proveedor':
        return 'Ya vendo alfajores y busco mejor proveedor'
      default:
        return etapa
    }
  }

  const getCantidadText = (cantidad?: string) => {
    switch (cantidad) {
      case 'menos-24':
        return 'Menos de 24 docenas'
      case '24-100':
        return 'Entre 24 docenas y 100 docenas'
      case 'mas-100':
        return 'Más de 100 docenas'
      default:
        return 'No especificado'
    }
  }

  // Limpiar número de WhatsApp para el enlace de llamada
  const phoneNumber = data.whatsapp.replace(/\D/g, '')
  const formattedPhone = data.whatsapp

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nuevo Lead - ${data.nombre}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #E65C37;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #E65C37;
            margin: 0;
            font-size: 28px;
        }
        .lead-info {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .info-row {
            display: flex;
            margin: 12px 0;
            border-bottom: 1px solid #eee;
            padding-bottom: 8px;
        }
        .info-label {
            font-weight: bold;
            color: #666;
            width: 150px;
            flex-shrink: 0;
        }
        .info-value {
            color: #333;
            flex: 1;
        }
        .priority-high {
            background: #d4edda;
            border-left: 4px solid #28a745;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .priority-medium {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .priority-low {
            background: #f8d7da;
            border-left: 4px solid #dc3545;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .actions {
            text-align: center;
            margin: 30px 0;
        }
        .btn {
            display: inline-block;
            padding: 15px 30px;
            margin: 10px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            font-size: 16px;
            transition: all 0.3s;
        }
        .btn-call {
            background: #28a745;
            color: white;
        }
        .btn-whatsapp {
            background: #25D366;
            color: white;
        }
        .btn-email {
            background: #007bff;
            color: white;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        .timestamp {
            text-align: center;
            color: #666;
            font-size: 14px;
            margin-top: 30px;
            border-top: 1px solid #eee;
            padding-top: 20px;
        }
        .comments {
            background: #e9ecef;
            border-radius: 6px;
            padding: 15px;
            margin: 15px 0;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Nuevo Lead de MIMI</h1>
            <p style="color: #666; margin: 5px 0;">Formulario completado</p>
        </div>

        <div class="lead-info">
            <div class="info-row">
                <div class="info-label">👤 Nombre:</div>
                <div class="info-value"><strong>${data.nombre}</strong></div>
            </div>
            <div class="info-row">
                <div class="info-label">🏪 Negocio:</div>
                <div class="info-value"><strong>${data.negocio}</strong></div>
            </div>
            <div class="info-row">
                <div class="info-label">📍 Ubicación:</div>
                <div class="info-value">${data.ubicacion}</div>
            </div>
            <div class="info-row">
                <div class="info-label">📦 Cantidad:</div>
                <div class="info-value">${getCantidadText(data.cantidad)}</div>
            </div>
            <div class="info-row">
                <div class="info-label">📞 WhatsApp:</div>
                <div class="info-value"><strong>${formattedPhone}</strong></div>
            </div>
            ${data.email ? `
            <div class="info-row">
                <div class="info-label">📧 Email:</div>
                <div class="info-value">${data.email}</div>
            </div>
            ` : ''}
        </div>

        <div class="${data.etapa === 'listo-primer-pedido' ? 'priority-high' : 
                     data.etapa === 'empezar-pronto' ? 'priority-medium' : 'priority-low'}">
            <strong>🎯 Etapa del cliente:</strong><br>
            ${getEtapaText(data.etapa)}
        </div>

        ${data.comentarios ? `
        <div class="comments">
            <strong>💬 Comentarios:</strong><br>
            "${data.comentarios}"
        </div>
        ` : ''}

        <div class="actions">
            <a href="tel:+${phoneNumber}" class="btn btn-call">
                📞 LLAMAR AHORA
            </a>
            <a href="https://wa.me/${phoneNumber}" class="btn btn-whatsapp" target="_blank">
                💬 WhatsApp
            </a>
            ${data.email ? `
            <a href="mailto:${data.email}" class="btn btn-email">
                📧 Email
            </a>
            ` : ''}
        </div>

        <div class="timestamp">
            ⏰ Recibido el ${formatDate(data.createdAt)}
        </div>
    </div>
</body>
</html>
  `
} 