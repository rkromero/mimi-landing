# MIMI Landing - Alfajores Premium Argentinos

Landing page para distribuidores de alfajores MIMI con sistema de formularios integrado.

## 🚀 Características

- **Landing page moderna** con diseño responsive
- **Sistema de formularios** con validación
- **Base de datos PostgreSQL** con Prisma ORM
- **Panel de administración** para ver formularios enviados
- **Integración con WhatsApp** y email
- **Optimizado para SEO** y performance

## 🛠️ Tecnologías

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Shadcn/UI
- **Backend**: Next.js API Routes
- **Base de datos**: PostgreSQL con Prisma ORM
- **Despliegue**: Railway

## 📦 Instalación

1. Clona el repositorio:
```bash
git clone <tu-repo-url>
cd mimi-landing
```

2. Instala las dependencias:
```bash
npm install --legacy-peer-deps
```

3. Configura las variables de entorno:
```bash
cp env.example .env
```

4. Configura tu base de datos PostgreSQL en `.env`:
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/mimi_landing"
```

5. Genera el cliente de Prisma y sincroniza la base de datos:
```bash
npx prisma generate
npx prisma db push
```

6. Inicia el servidor de desarrollo:
```bash
npm run dev
```

## 🗄️ Base de Datos

El proyecto usa PostgreSQL con Prisma ORM. El esquema incluye:

- **ContactForm**: Almacena los formularios de contacto enviados
  - Información personal (nombre, negocio, ubicación)
  - Datos de contacto (WhatsApp, email)
  - Información comercial (cantidad estimada, etapa de compra)
  - Comentarios adicionales

## 📱 Funcionalidades

### Landing Page
- Hero section con call-to-action
- Sección de beneficios para distribuidores
- Galería de productos
- Testimonios de clientes
- FAQ section
- Formulario de contacto

### Sistema de Formularios
- Validación en tiempo real
- Campos obligatorios marcados
- Estados de carga y confirmación
- Almacenamiento en base de datos

### Panel de Administración
- Acceso en `/admin`
- Vista de todos los formularios enviados
- Filtros por estado y fecha
- Enlaces directos a WhatsApp y email

## 🚀 Despliegue en Railway

1. Crea una cuenta en [Railway](https://railway.app)
2. Conecta tu repositorio de GitHub
3. Agrega una base de datos PostgreSQL
4. Configura las variables de entorno:
   - `DATABASE_URL`: URL de tu base de datos PostgreSQL
5. El despliegue será automático

## 📝 Variables de Entorno

```env
DATABASE_URL="postgresql://username:password@host:port/database"
```

## 🔧 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta el linter
- `npx prisma studio` - Abre Prisma Studio para ver la base de datos
- `npx prisma generate` - Genera el cliente de Prisma
- `npx prisma db push` - Sincroniza el esquema con la base de datos

## 📞 Contacto

Para soporte técnico o consultas comerciales:
- Email: ventas@alfajoresmimi.com
- WhatsApp: +54 9 11 7363-9684

## 📄 Licencia

Este proyecto es privado y pertenece a MIMI Alfajores. 