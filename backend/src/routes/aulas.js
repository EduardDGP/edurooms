const express = require('express')
const { getDB } = require('../config/database')
const { verificarToken } = require('../middleware/auth')

const router = express.Router()

// Todas las rutas requieren estar autenticado
router.use(verificarToken)

// ── GET /api/aulas ────────────────────────────────────────
// Devuelve todas las aulas con su reserva de hoy (si tiene)
router.get('/', (req, res) => {
  const db = getDB()
  const hoy = new Date().toISOString().split('T')[0]

  const aulas = db.prepare('SELECT * FROM aulas ORDER BY nombre').all()

  const result = aulas.map(aula => {
    // Buscar reserva de hoy para esta aula
    const reserva = db.prepare(`
      SELECT r.*, p.nombre, p.apellidos, p.asignatura as prof_asignatura
      FROM reservas r
      JOIN profesores p ON p.id = r.profesor_id
      WHERE r.aula_id = ? AND r.fecha = ?
      ORDER BY r.hora_inicio
      LIMIT 1
    `).get(aula.id, hoy)

    return { ...aula, reserva: reserva || null }
  })

  res.json(result)
})

// ── POST /api/aulas ───────────────────────────────────────
router.post('/', (req, res) => {
  const { nombre, tipo, capacidad } = req.body
  if (!nombre || !tipo) {
    return res.status(400).json({ error: 'Nombre y tipo son obligatorios' })
  }

  const db = getDB()
  const result = db.prepare(
    'INSERT INTO aulas (nombre, tipo, capacidad) VALUES (?, ?, ?)'
  ).run(nombre, tipo, capacidad || 30)

  const aula = db.prepare('SELECT * FROM aulas WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json(aula)
})

// ── DELETE /api/aulas/:id ─────────────────────────────────
router.delete('/:id', (req, res) => {
  const db = getDB()
  const aula = db.prepare('SELECT * FROM aulas WHERE id = ?').get(req.params.id)
  if (!aula) return res.status(404).json({ error: 'Aula no encontrada' })

  // ON DELETE CASCADE elimina reservas asociadas automáticamente
  db.prepare('DELETE FROM aulas WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

module.exports = router
