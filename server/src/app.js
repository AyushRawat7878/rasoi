import cors from 'cors'
import express from 'express'
import { config } from './config.js'
import authRoutes from './routes/auth.js'
import menuRoutes from './routes/menu.js'
import orderRoutes from './routes/orders.js'

export function createApp() {
  const app = express()
  app.use(cors({ origin: config.clientOrigin }))
  app.use(express.json({ limit: '100kb' }))
  app.use((req, res, next) => {
    req.body ??= {} // Express 5 leaves body undefined when nothing was sent
    next()
  })

  app.get('/api/health', (req, res) => res.json({ ok: true }))
  app.use('/api/auth', authRoutes)
  app.use('/api/menu', menuRoutes)
  app.use('/api/orders', orderRoutes)

  app.use((req, res) => res.status(404).json({ message: 'Not found' }))

  // Express 5 sends errors from async routes here automatically
  app.use((err, req, res, next) => {
    if (err.name === 'ValidationError' || err.name === 'CastError') {
      return res.status(400).json({ message: err.message })
    }
    console.error(err)
    res.status(500).json({ message: 'Something went wrong on our side' })
  })
  return app
}
