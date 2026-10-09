import { Router } from 'express'
import { CATEGORIES, MenuItem } from '../models/MenuItem.js'
import { requireAdmin, requireAuth } from '../middleware/auth.js'

const router = Router()
const EDITABLE = ['name', 'description', 'price', 'category', 'isVeg', 'emoji', 'imageUrl', 'spicy', 'isAvailable', 'isBestseller']

function pick(body) {
  return Object.fromEntries(EDITABLE.filter((k) => body[k] !== undefined).map((k) => [k, body[k]]))
}

// GET /api/menu?category=Biryani&veg=true&q=paneer   (veg=true: only veg, veg=false: only non-veg)
// Customers only see available dishes; admins can add ?all=true to see everything.
router.get('/', async (req, res) => {
  const filter = {}
  if (req.query.all !== 'true') filter.isAvailable = true
  if (req.query.category && CATEGORIES.includes(req.query.category)) filter.category = req.query.category
  if (req.query.veg === 'true') filter.isVeg = true
  if (req.query.veg === 'false') filter.isVeg = false
  if (req.query.q) {
    const safe = String(req.query.q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // treat the search as plain text
    filter.name = { $regex: safe, $options: 'i' }
  }
  const items = await MenuItem.find(filter).sort({ category: 1, isBestseller: -1, name: 1 })
  res.json({ items, categories: CATEGORIES })
})

// Admin only: add, edit, delete dishes
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const item = await MenuItem.create(pick(req.body))
  res.status(201).json({ item })
})

router.patch('/:id', requireAuth, requireAdmin, async (req, res) => {
  const item = await MenuItem.findByIdAndUpdate(req.params.id, pick(req.body), { new: true, runValidators: true })
  if (!item) return res.status(404).json({ message: 'Dish not found' })
  res.json({ item })
})

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const item = await MenuItem.findByIdAndDelete(req.params.id)
  if (!item) return res.status(404).json({ message: 'Dish not found' })
  res.json({ ok: true })
})

export default router
