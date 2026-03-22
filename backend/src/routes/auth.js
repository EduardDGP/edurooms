const express = require('express')
const bcrypt  = require('bcryptjs')
const { getDB } = require('../config/database')
const { generarToken, verificarToken } = require('../middleware/auth')

const router = express.Router()

// ── POST /api/auth/registro ───────────────────────────────
router.post('/registro', (req, res) => {
  const { nombre, apellidos, email, password, asignatura } = req.body

  if (!nombre || !apellidos || !email || !password || !asignatura) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' })
  }

  const db = getDB()

  // Comprobar si el email ya existe
  const existe = db.prepare('SELECT id FROM profesores WHERE email = ?').get(email)
  if (existe) {
    return res.status(409).json({ error: 'Este correo ya está registrado' })
  }

  // Hashear contraseña
  const hash = bcrypt.hashSync(password, 10)

  const result = db.prepare(
    'INSERT INTO profesores (nombre, apellidos, email, password, asignatura) VALUES (?, ?, ?, ?, ?)'
  ).run(nombre, apellidos, email, hash, asignatura)

  const profesor = db.prepare('SELECT * FROM profesores WHERE id = ?').get(result.lastInsertRowid)
  const token = generarToken(profesor)

  // No devolver el password
  const { password: _, ...safe } = profesor
  res.status(201).json({ token, profesor: safe })
})

// ── POST /api/auth/login ──────────────────────────────────
router.post('/login', (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña requeridos' })
  }

  const db = getDB()
  const profesor = db.prepare('SELECT * FROM profesores WHERE email = ?').get(email)

  if (!profesor) {
    return res.status(401).json({ error: 'Credenciales incorrectas' })
  }

  const ok = bcrypt.compareSync(password, profesor.password)
  if (!ok) {
    return res.status(401).json({ error: 'Credenciales incorrectas' })
  }

  const token = generarToken(profesor)
  const { password: _, ...safe } = profesor
  res.json({ token, profesor: safe })
})

// ── GET /api/auth/me ──────────────────────────────────────
// Devuelve los datos del profesor autenticado
router.get('/me', verificarToken, (req, res) => {
  const db = getDB()
  const profesor = db.prepare(
    'SELECT id, nombre, apellidos, email, asignatura, foto, created_at FROM profesores WHERE id = ?'
  ).get(req.profesorId)

  if (!profesor) return res.status(404).json({ error: 'Profesor no encontrado' })
  res.json(profesor)
})

module.exports = router
