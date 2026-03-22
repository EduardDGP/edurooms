const express = require('express')
const { getDB } = require('../config/database')
const { verificarToken, soloDirector } = require('../middleware/auth')

const router = express.Router()
router.use(verificarToken, soloDirector)

// ── GET /api/admin/pendientes ─────────────────────────────
// Cuentas pendientes de aprobación
router.get('/pendientes', (req, res) => {
  const db = getDB()
  const lista = db.prepare(
    "SELECT id, nombre, apellidos, email, asignatura, created_at FROM profesores WHERE aprobado = 0 AND rol = 'profesor' ORDER BY created_at DESC"
  ).all()
  res.json(lista)
})

// ── GET /api/admin/profesores ─────────────────────────────
// Todos los profesores (aprobados, pendientes y rechazados)
router.get('/profesores', (req, res) => {
  const db = getDB()
  const lista = db.prepare(
    "SELECT id, nombre, apellidos, email, asignatura, aprobado, created_at FROM profesores WHERE rol = 'profesor' ORDER BY aprobado, nombre"
  ).all()
  res.json(lista)
})

// ── PUT /api/admin/aprobar/:id ────────────────────────────
router.put('/aprobar/:id', (req, res) => {
  const db = getDB()
  const prof = db.prepare('SELECT * FROM profesores WHERE id = ?').get(req.params.id)
  if (!prof) return res.status(404).json({ error: 'Profesor no encontrado' })

  db.prepare('UPDATE profesores SET aprobado = 1 WHERE id = ?').run(req.params.id)
  res.json({ ok: true, mensaje: `${prof.nombre} ${prof.apellidos} aprobado/a` })
})

// ── PUT /api/admin/rechazar/:id ───────────────────────────
router.put('/rechazar/:id', (req, res) => {
  const db = getDB()
  const prof = db.prepare('SELECT * FROM profesores WHERE id = ?').get(req.params.id)
  if (!prof) return res.status(404).json({ error: 'Profesor no encontrado' })

  db.prepare('UPDATE profesores SET aprobado = 2 WHERE id = ?').run(req.params.id)
  res.json({ ok: true, mensaje: `${prof.nombre} ${prof.apellidos} rechazado/a` })
})

// ── DELETE /api/admin/profesores/:id ─────────────────────
router.delete('/profesores/:id', (req, res) => {
  const db = getDB()
  db.prepare('DELETE FROM profesores WHERE id = ? AND rol = ?').run(req.params.id, 'profesor')
  res.json({ ok: true })
})

module.exports = router