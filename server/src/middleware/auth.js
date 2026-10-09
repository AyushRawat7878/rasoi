import jwt from 'jsonwebtoken'
import { config } from '../config.js'
import { User } from '../models/User.js'

export function signToken(user) {
  return jwt.sign({ sub: String(user._id), role: user.role }, config.jwtSecret, { expiresIn: '7d' })
}

/** Requires a valid "Authorization: Bearer <token>" header; puts the user on req.user. */
export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ message: 'Please log in first' })
  try {
    const payload = jwt.verify(token, config.jwtSecret)
    const user = await User.findById(payload.sub)
    if (!user) return res.status(401).json({ message: 'Account not found' })
    req.user = user
    next()
  } catch {
    res.status(401).json({ message: 'Your session has expired. Please log in again.' })
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admins only' })
  next()
}
