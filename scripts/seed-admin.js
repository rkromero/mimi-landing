const { PrismaClient, CrmRole } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD?.trim()
  const name = process.env.ADMIN_NAME?.trim() || 'Administrador CRM'

  if (!email || !password) {
    console.log('[seed-admin] ADMIN_EMAIL o ADMIN_PASSWORD no configurados. Se omite bootstrap de admin.')
    return
  }

  if (password.length < 10) {
    throw new Error('ADMIN_PASSWORD debe tener al menos 10 caracteres.')
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const existing = await prisma.crmUser.findUnique({
    where: { email },
    select: { id: true },
  })

  if (existing) {
    await prisma.crmUser.update({
      where: { email },
      data: {
        name,
        role: CrmRole.ADMIN,
        passwordHash,
      },
    })
    console.log('[seed-admin] Usuario admin actualizado.')
    return
  }

  await prisma.crmUser.create({
    data: {
      email,
      name,
      passwordHash,
      role: CrmRole.ADMIN,
    },
  })

  console.log('[seed-admin] Usuario admin creado.')
}

main()
  .catch((error) => {
    console.error('[seed-admin] Error:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
