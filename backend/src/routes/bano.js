const express = require('express')
const { getDB } = require('../config/database')
const { verificarToken } = require('../middleware/auth')

const router = express.Router()
router.use(verificarToken)

// ── GET /api/bano ─────────────────────────────────────────
// Salidas de HOY (todos los profesores pueden verlo)
router.get('/', (req, res) => {
  const db = getDB()
  const hoy = new Date().toISOString().split('T')[0]
  const salidas = db.prepare(`
    SELECT s.*, p.nombre as prof_nombre, p.apellidos as prof_apellidos
    FROM salidas_bano s
    JOIN profesores p ON p.id = s.profesor_id
    WHERE s.fecha = ?
    ORDER BY s.hora DESC
  `).all(hoy)
  res.json(salidas)
})

// ── GET /api/bano/historial ───────────────────────────────
// Historial completo de días anteriores (excluye hoy)
router.get('/historial', (req, res) => {
  const db = getDB()
  const hoy = new Date().toISOString().split('T')[0]
  const salidas = db.prepare(`
    SELECT s.*, p.nombre as prof_nombre, p.apellidos as prof_apellidos
    FROM salidas_bano s
    JOIN profesores p ON p.id = s.profesor_id
    WHERE s.fecha < ?
    ORDER BY s.fecha DESC, s.hora DESC
    LIMIT 500
  `).all(hoy)
  res.json(salidas)
})

// ── POST /api/bano ────────────────────────────────────────
router.post('/', (req, res) => {
  const { alumno_nombre, alumno_curso } = req.body
  if (!alumno_nombre?.trim() || !alumno_curso?.trim()) {
    return res.status(400).json({ error: 'Nombre del alumno y curso son obligatorios' })
  }

  const db    = getDB()
  const now   = new Date()
  const fecha = now.toISOString().split('T')[0]
  const hora  = now.toTimeString().slice(0, 5)

  const result = db.prepare(`
    INSERT INTO salidas_bano (profesor_id, alumno_nombre, alumno_curso, fecha, hora)
    VALUES (?, ?, ?, ?, ?)
  `).run(req.profesorId, alumno_nombre.trim(), alumno_curso.trim(), fecha, hora)

  const salida = db.prepare(`
    SELECT s.*, p.nombre as prof_nombre, p.apellidos as prof_apellidos
    FROM salidas_bano s JOIN profesores p ON p.id = s.profesor_id
    WHERE s.id = ?
  `).get(result.lastInsertRowid)

  res.status(201).json(salida)
})

// ── PUT /api/bano/:id ─────────────────────────────────────
// Editar registro — solo el mismo día y el mismo profesor
router.put('/:id', (req, res) => {
  const db = getDB()
  const salida = db.prepare('SELECT * FROM salidas_bano WHERE id = ?').get(req.params.id)

  if (!salida) return res.status(404).json({ error: 'Registro no encontrado' })
  if (salida.profesor_id !== req.profesorId) {
    return res.status(403).json({ error: 'Solo puedes editar tus propios registros' })
  }

  const hoy = new Date().toISOString().split('T')[0]
  if (salida.fecha !== hoy) {
    return res.status(403).json({ error: 'Solo puedes editar registros del día de hoy' })
  }

  const { alumno_nombre, alumno_curso } = req.body
  if (!alumno_nombre?.trim() || !alumno_curso?.trim()) {
    return res.status(400).json({ error: 'Nombre y curso son obligatorios' })
  }

  db.prepare(`
    UPDATE salidas_bano SET alumno_nombre = ?, alumno_curso = ? WHERE id = ?
  `).run(alumno_nombre.trim(), alumno_curso.trim(), req.params.id)

  const actualizada = db.prepare(`
    SELECT s.*, p.nombre as prof_nombre, p.apellidos as prof_apellidos
    FROM salidas_bano s JOIN profesores p ON p.id = s.profesor_id
    WHERE s.id = ?
  `).get(req.params.id)

  res.json(actualizada)
})

// ── DELETE /api/bano/:id ──────────────────────────────────
router.delete('/:id', (req, res) => {
  const db = getDB()
  const salida = db.prepare('SELECT * FROM salidas_bano WHERE id = ?').get(req.params.id)

  if (!salida) return res.status(404).json({ error: 'Registro no encontrado' })
  if (salida.profesor_id !== req.profesorId) {
    return res.status(403).json({ error: 'Solo puedes borrar tus propios registros' })
  }

  db.prepare('DELETE FROM salidas_bano WHERE id = ?').run(req.params.id)
  res.json({ ok: true })
})

module.exports = router