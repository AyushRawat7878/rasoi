import { Router } from 'express'
import mongoose from 'mongoose'
import { MenuItem } from '../models/MenuItem.js'
import { ORDER_STATUSES, Order } from '../models/Order.js'
import { requireAdmin, requireAuth } from '../middleware/auth.js'
import { priceOrder } from '../pricing.js'

const router = Router()
router.use(requireAuth) // every order route needs a logged-in user

// POST /api/orders  { lines: [{ item, qty }], address, phone, note }
// The browser only sends WHICH dishes and HOW MANY. Prices come from the database, never from the browser.
router.post('/', async (req, res) => {
  const { lines = [], note = '' } = req.body
  const address = String(req.body.address || '').trim()
  const phone = String(req.body.phone || '').trim()
  if (!Array.isArray(lines) || lines.length === 0) return res.status(400).json({ message: 'Your cart is empty' })
  if (address.length < 10) return res.status(400).json({ message: 'Please enter your full delivery address' })
  if (!/^[6-9]\d{9}$/.test(phone.replace(/\D/g, '').slice(-10))) {
    return res.status(400).json({ message: 'Please enter a valid 10-digit mobile number' })
  }

  const ids = lines.map((l) => l.item)
  if (!ids.every((id) => mongoose.isValidObjectId(id))) return res.status(400).json({ message: 'Invalid dish in cart' })
  const dishes = await MenuItem.find({ _id: { $in: ids } })
  const byId = new Map(dishes.map((d) => [String(d._id), d]))

  const orderLines = []
  for (const line of lines) {
    const dish = byId.get(String(line.item))
    const qty = Math.floor(Number(line.qty))
    if (!dish) return res.status(400).json({ message: 'A dish in your cart no longer exists' })
    if (!dish.isAvailable) return res.status(400).json({ message: `${dish.name} is not available right now` })
    if (!(qty >= 1 && qty <= 20)) return res.status(400).json({ message: 'Quantity must be between 1 and 20' })
    orderLines.push({ item: dish._id, name: dish.name, price: dish.price, qty, isVeg: dish.isVeg, emoji: dish.emoji })
  }

  const order = await Order.create({
    user: req.user._id,
    lines: orderLines,
    ...priceOrder(orderLines),
    address,
    phone,
    note: String(note).slice(0, 200),
    statusHistory: [{ status: 'placed' }],
  })

  // Remember address and phone for next time
  req.user.address = address
  req.user.phone = phone
  await req.user.save()

  res.status(201).json({ order })
})

// GET /api/orders/mine  (my orders, newest first)
router.get('/mine', async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 })
  res.json({ orders })
})

// GET /api/orders/:id  (one order: the owner or an admin)
router.get('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Order not found' })
  const order = await Order.findById(req.params.id)
  const allowed = order && (String(order.user) === String(req.user._id) || req.user.role === 'admin')
  if (!allowed) return res.status(404).json({ message: 'Order not found' })
  res.json({ order })
})

// POST /api/orders/:id/cancel  (customer can cancel only before the kitchen starts)
router.post('/:id/cancel', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Order not found' })
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
  if (!order) return res.status(404).json({ message: 'Order not found' })
  if (order.status !== 'placed') return res.status(400).json({ message: 'The kitchen has already started this order' })
  order.status = 'cancelled'
  order.statusHistory.push({ status: 'cancelled' })
  await order.save()
  res.json({ order })
})

// ---------- Admin ----------

// GET /api/orders?status=placed  (all orders)
router.get('/', requireAdmin, async (req, res) => {
  const filter = ORDER_STATUSES.includes(req.query.status) ? { status: req.query.status } : {}
  const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(200).populate('user', 'name email')
  res.json({ orders })
})

// PATCH /api/orders/:id/status  { status }
router.patch('/:id/status', requireAdmin, async (req, res) => {
  const { status } = req.body
  if (!ORDER_STATUSES.includes(status)) return res.status(400).json({ message: 'Unknown status' })
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Order not found' })
  const order = await Order.findById(req.params.id)
  if (!order) return res.status(404).json({ message: 'Order not found' })
  if (['delivered', 'cancelled'].includes(order.status)) {
    return res.status(400).json({ message: `This order is already ${order.status}` })
  }
  order.status = status
  order.statusHistory.push({ status })
  await order.save()
  res.json({ order })
})

export default router
