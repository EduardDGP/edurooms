const express = require('express')
const { getDB } = require('../config/database')
const { verificarToken } = require('../middleware/auth')

const router = express.Router()
router.use(verificarToken)

// ── GET /api/alumnos ──────────────────────────────────────
// Todos los alumnos, opcionalmente filtrados por curso y grupo
router.get('/', (req, res) => {
  const db = getDB()
  const { curso, grupo } = req.query

  let query = 'SELECT * FROM alumnos WHERE 1=1'
  const params = []

  if (curso) { query += ' AND curso = ?'; params.push(curso) }
  if (grupo) { query += ' AND grupo = ?'; params.push(grupo) }

  query += ' ORDER BY apellidos, nombre'
  res.json(db.prepare(query).all(...params))
})

// ── GET /api/alumnos/cursos ───────────────────────────────
// Lista de cursos y grupos disponibles
router.get('/cursos', (req, res) => {
  const db = getDB()
  const lista = db.prepare(`
    SELECT curso, grupo, COUNT(*) as total
    FROM alumnos
    GROUP BY curso, grupo
    ORDER BY curso, grupo
  `).all()
  res.json(lista)
})

// ── POST /api/alumnos/importar ────────────────────────────
// Importar lista de alumnos (reemplaza los del mismo curso+grupo)
router.post('/importar', (req, res) => {
  const { curso, grupo, alumnos } = req.body

  if (!curso || !grupo || !Array.isArray(alumnos) || alumnos.length === 0) {
    return res.status(400).json({ error: 'Curso, grupo y lista de alumnos son obligatorios' })
  }

  const db = getDB()

  // Borrar alumnos existentes de ese curso+grupo
  db.prepare('DELETE FROM alumnos WHERE curso = ? AND grupo = ?').run(curso, grupo)

  // Insertar nuevos
  const ins = db.prepare('INSERT INTO alumnos (apellidos, nombre, curso, grupo) VALUES (?, ?, ?, ?)')
  const insertMany = db.transaction((lista) => {
    for (const a of lista) {
      if (a.apellidos?.trim() && a.nombre?.trim()) {
        ins.run(a.apellidos.trim(), a.nombre.trim(), curso, grupo)
      }
    }
  })
  insertMany(alumnos)

  const total = db.prepare('SELECT COUNT(*) as n FROM alumnos WHERE curso = ? AND grupo = ?').get(curso, grupo)
  res.status(201).json({ ok: true, importados: total.n })
})

// ── DELETE /api/alumnos/curso ─────────────────────────────
// Borrar todos los alumnos de un curso+grupo
router.delete('/grupo', (req, res) => {
  const { curso, grupo } = req.query
  if (!curso || !grupo) return res.status(400).json({ error: 'Curso y grupo requeridos' })

  const db = getDB()
  db.prepare('DELETE FROM alumnos WHERE curso = ? AND grupo = ?').run(curso, grupo)
  res.json({ ok: true })
})

module.exports = router