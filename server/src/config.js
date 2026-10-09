import 'dotenv/config'

export const config = {
  jwtSecret: process.env.JWT_SECRET || 'dev-only-secret-change-me',
  port: Number(process.env.PORT || 5000),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@rasoi.test',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin12345',
}

// Delivery and tax rules, in rupees. Kept in one place so the cart and the server agree.
export const PRICING = {
  freeDeliveryAbove: 299,
  deliveryFee: 40,
  gstRate: 0.05, // 5% GST on food
}
