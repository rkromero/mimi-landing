#!/bin/bash

# Generar cliente de Prisma
echo "Generating Prisma client..."
npx prisma generate

# Sincronizar base de datos
echo "Pushing database schema..."
npx prisma db push --accept-data-loss

# Iniciar la aplicación
echo "Starting Next.js application..."
npm start 