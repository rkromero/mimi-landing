#!/bin/bash
set -e

# Generar cliente de Prisma
echo "🔧 Generating Prisma client..."
npx prisma generate

# Verificar conexión a la base de datos
echo "🔍 Checking database connection..."
npx prisma db push --accept-data-loss

# Esperar un momento para que todo se estabilice
echo "⏳ Waiting for database to be ready..."
sleep 2

# Iniciar la aplicación
echo "🚀 Starting Next.js application..."
npm start 