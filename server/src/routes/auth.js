import { Router } from 'express'
import { User } from '../models/User.js'
import { requireAuth, signToken } from '../middleware/auth.js'

const router = Router()
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// POST /api/auth/register  { name, email, password }
router.post('/register', async (req, res) => {
  const name = String(req.body.name || '').trim()
  const email = String(req.body.email || '').trim().toLowerCase()
  const password = String(req.body.password || '')
  if (!name) return res.status(400).json({ message: 'Please enter your name' })
  if (!EMAIL.test(email)) return res.status(400).json({ message: 'Please enter a valid email' })
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' })
  if (await User.exists({ email })) return res.status(409).json({ message: 'An account with this email already exists' })

  const user = await User.create({ name, email, passwordHash: await User.hashPassword(password) })
  res.status(201).json({ token: signToken(user), user: user.toPublic() })
})

// POST /api/auth/login  { email, password }
router.post('/login', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase()
  const user = await User.findOne({ email })
  // Same message either way, so nobody can find out which emails have accounts
  if (!user || !(await user.checkPassword(String(req.body.password || '')))) {
    return res.status(401).json({ message: 'Wrong email or password' })
  }
  res.json({ token: signToken(user), user: user.toPublic() })
})

// GET /api/auth/me  (who am I?)
router.get('/me', requireAuth, (req, res) => res.json({ user: req.user.toPublic() }))

export default router
