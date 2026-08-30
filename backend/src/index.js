const express = require('express')
const cors    = require('cors')
const path    = require('path')
const { initDB } = require('./config/database')

const authRoutes    = require('./routes/auth')
const aulasRoutes   = require('./routes/aulas')
const reservasRoutes= require('./routes/reservas')
const socialRoutes  = require('./routes/social')
const perfilRoutes  = require('./routes/perfil')
const banoRoutes    = require('./routes/bano')
const adminRoutes   = require('./routes/admin')
const alumnosRoutes       = require('./routes/alumnos')
const notificacionesRoutes= require('./routes/notificaciones')
const guardiasRoutes      = require('./routes/guardias')
const superadminRoutes    = require('./routes/superadmin')
const stripeRoutes        = require('./routes/stripe')
const franjasRoutes       = require('./routes/franjas')

const app  = express()
const PORT = 3001

// Un error no controlado en una ruta async (p. ej. un fallo de SQL) no debe
// tumbar el servidor entero para todos los centros: lo registramos y seguimos.
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err)
})
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err)
})

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))

// Webhook de Stripe ANTES del middleware JSON (necesita body raw)
app.use('/api/stripe/webhook', stripeRoutes)

app.use((req, res, next) => {
  if (req.path === '/api/stripe/webhook') return next()
  express.json()(req, res, next)
})
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.use('/api/auth',    authRoutes)
app.use('/api/aulas',   aulasRoutes)
app.use('/api/reservas',reservasRoutes)
app.use('/api/social',  socialRoutes)
app.use('/api/perfil',  perfilRoutes)
app.use('/api/bano',    banoRoutes)
app.use('/api/admin',   adminRoutes)
app.use('/api/alumnos',        alumnosRoutes)
app.use('/api/notificaciones', notificacionesRoutes)
app.use('/api/guardias',       guardiasRoutes)
app.use('/api/superadmin',     superadminRoutes)
app.use('/api/franjas',        franjasRoutes)
app.use('/api/stripe',         stripeRoutes)

app.get('/api/health', (req, res) => res.json({ ok: true }))

// Red de seguridad: cualquier error no manejado por una ruta (síncrona o
// async, vía next(err)) responde con JSON en vez de tumbar la petición o
// dejar el servidor en un estado raro.
app.use((err, req, res, next) => {
  console.error('Error en', req.method, req.path, ':', err)
  if (res.headersSent) return next(err)
  res.status(500).json({ error: 'Error interno del servidor' })
})

initDB()
app.listen(PORT, () => {
  console.log(`✅  EduRooms backend corriendo en http://localhost:${PORT}`)
})