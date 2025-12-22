const fs = require('fs')
const path = require('path')
const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedUsers() {
  const adminPassword = await bcrypt.hash('admin123', 10)
  const customerPassword = await bcrypt.hash('customer123', 10)

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      first_name: 'admin',
      last_name: 'admin',
      email: 'admin@example.com',
      password_hash: adminPassword,
      role: 'ADMIN',
      locked: false,
      avatar_url: null
    }
  })

  await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      first_name: 'John',
      last_name: 'Witch',
      email: 'customer@example.com',
      password_hash: customerPassword,
      role: 'CUSTOMER',
      locked: false,
      avatar_url: null
    }
  })
}

async function seedCart() {
  const customer = await prisma.user.findUnique({
    where: { email: 'customer@example.com' }
  })

  if (!customer) return

  await prisma.cart.upsert({
    where: { user_id: customer.user_id },
    update: {},
    create: {
      user_id: customer.user_id,
      total_items: 0,
      total_price: 0
    }
  })
}

async function seedCategories() {
  const filePath = path.join(__dirname, 'categories.json')
  const categories = JSON.parse(fs.readFileSync(filePath, 'utf8'))

  await prisma.category.createMany({
    data: categories,
    skipDuplicates: true
  })
}

async function seedOrderStatus() {
  const status = [
    { order_status_code: 'CREATED',   order_status_name: 'Chờ xác nhận' },
    { order_status_code: 'CONFIRMED', order_status_name: 'Đã xác nhận' },
    { order_status_code: 'PREPARING', order_status_name: 'Chuẩn bị hàng' },
    { order_status_code: 'SHIPPING',  order_status_name: 'Đang vận chuyển' },
    { order_status_code: 'DELIVERED', order_status_name: 'Đã giao hàng' },
    { order_status_code: 'COMPLETED', order_status_name: 'Hoàn thành' },
    { order_status_code: 'CANCELLED', order_status_name: 'Đã hủy' },
    { order_status_code: 'REFUNDED',  order_status_name: 'Đã hoàn tiền' }
  ]

  await prisma.orderStatus.createMany({
    data: status,
    skipDuplicates: true
  })
}

async function main() {
  console.log('🌱 Seeding database...')

  await seedUsers()
  await seedCart()
  await seedCategories()
  await seedOrderStatus()

  console.log('✅ Seed completed')
}

main()
  .catch(err => {
    console.error('❌ Seed failed:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
