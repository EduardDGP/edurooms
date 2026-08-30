const Database = require('better-sqlite3')
const path     = require('path')
const bcrypt   = require('bcryptjs')

const DB_PATH = path.join(__dirname, 'edurooms.db')
let db

function getDB() {
  if (!db) db = new Database(DB_PATH)
  return db
}

const FRANJAS_DEFECTO = [
  { orden: 1, label: '1ª hora', inicio: '08:15', fin: '09:10', reservable: 1 },
  { orden: 2, label: '2ª hora', inicio: '09:10', fin: '10:05', reservable: 1 },
  { orden: 3, label: '3ª hora', inicio: '10:05', fin: '11:00', reservable: 1 },
  { orden: 4, label: 'Recreo',  inicio: '11:00', fin: '11:30', reservable: 0 },
  { orden: 5, label: '4ª hora', inicio: '11:30', fin: '12:25', reservable: 1 },
  { orden: 6, label: '5ª hora', inicio: '12:25', fin: '13:20', reservable: 1 },
  { orden: 7, label: '6ª hora', inicio: '13:20', fin: '14:15', reservable: 1 },
]

function sembrarFranjasPorDefecto(db, centroId) {
  const insertFranja = db.prepare(`
    INSERT INTO franjas_centro (centro_id, orden, label, hora_inicio, hora_fin, reservable)
    VALUES (?, ?, ?, ?, ?, ?)
  `)
  for (const f of FRANJAS_DEFECTO) {
    insertFranja.run(centroId, f.orden, f.label, f.inicio, f.fin, f.reservable)
  }
}

function initDB() {
  const db = getDB()
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  // ── Tabla: centros ────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS centros (
      id                   INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre               TEXT    NOT NULL,
      codigo               TEXT    NOT NULL UNIQUE,
      ciudad               TEXT    NOT NULL DEFAULT '',
      provincia            TEXT    NOT NULL DEFAULT '',
      logo                 TEXT    DEFAULT NULL,
      plan                 TEXT    NOT NULL DEFAULT 'pendiente',
      aprobado             INTEGER NOT NULL DEFAULT 0,
      email_verificado     INTEGER NOT NULL DEFAULT 0,
      token_verificacion   TEXT    DEFAULT NULL,
      stripe_customer_id   TEXT    DEFAULT NULL,
      traspaso_token       TEXT    DEFAULT NULL,
      traspaso_destino_id  INTEGER REFERENCES profesores(id) ON DELETE SET NULL,
      created_at           TEXT    DEFAULT (datetime('now'))
    )
  `)

  // Migra columnas nuevas en bases de datos ya existentes:
  // CREATE TABLE IF NOT EXISTS no altera una tabla que ya existe con
  // un esquema antiguo, así que columnas añadidas después (plan, aprobado,
  // traspaso_*, etc.) se añaden aquí a mano si faltan.
  const columnasCentros = new Set(db.prepare('PRAGMA table_info(centros)').all().map(c => c.name))
  const migracionesCentros = {
    plan:                "TEXT NOT NULL DEFAULT 'pendiente'",
    aprobado:            'INTEGER NOT NULL DEFAULT 0',
    email_verificado:    'INTEGER NOT NULL DEFAULT 0',
    token_verificacion:  'TEXT DEFAULT NULL',
    stripe_customer_id:  'TEXT DEFAULT NULL',
    traspaso_token:      'TEXT DEFAULT NULL',
    traspaso_destino_id: 'INTEGER REFERENCES profesores(id) ON DELETE SET NULL',
  }
  const seAnadioAprobado = !columnasCentros.has('aprobado')
  const seAnadioPlan     = !columnasCentros.has('plan')
  for (const [columna, definicion] of Object.entries(migracionesCentros)) {
    if (!columnasCentros.has(columna)) {
      db.exec(`ALTER TABLE centros ADD COLUMN ${columna} ${definicion}`)
      console.log(`✅  Migración: columna centros.${columna} añadida`)
    }
  }
  // Los centros que ya existían antes de introducir la aprobación por
  // superadmin/Stripe se dan por buenos (si no, quedarían bloqueados
  // de golpe al añadir la columna con su valor por defecto "pendiente").
  if (seAnadioAprobado) db.exec(`UPDATE centros SET aprobado = 1`)
  if (seAnadioPlan)     db.exec(`UPDATE centros SET plan = 'activo' WHERE plan = 'pendiente'`)

  // ── Tabla: profesores ─────────────────────────────────
  // rol: 'superadmin' | 'director' | 'jefe_estudios' | 'profesor'
  // aprobado: 0 = pendiente, 1 = aprobado, 2 = rechazado
  db.exec(`
    CREATE TABLE IF NOT EXISTS profesores (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      centro_id   INTEGER REFERENCES centros(id) ON DELETE CASCADE,
      nombre      TEXT    NOT NULL,
      apellidos   TEXT    NOT NULL,
      email       TEXT    NOT NULL UNIQUE,
      password    TEXT    NOT NULL,
      asignatura  TEXT    NOT NULL DEFAULT '',
      foto        TEXT    DEFAULT NULL,
      rol         TEXT    NOT NULL DEFAULT 'profesor',
      aprobado    INTEGER NOT NULL DEFAULT 0,
      ultima_actividad    TEXT    DEFAULT NULL,
      abandono_token      TEXT    DEFAULT NULL,
      abandono_solicitado INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT    DEFAULT (datetime('now'))
    )
  `)

  const columnasProfesores = new Set(db.prepare('PRAGMA table_info(profesores)').all().map(c => c.name))
  const migracionesProfesores = {
    ultima_actividad:    'TEXT DEFAULT NULL',
    abandono_token:      'TEXT DEFAULT NULL',
    abandono_solicitado: 'INTEGER NOT NULL DEFAULT 0',
  }
  for (const [columna, definicion] of Object.entries(migracionesProfesores)) {
    if (!columnasProfesores.has(columna)) {
      db.exec(`ALTER TABLE profesores ADD COLUMN ${columna} ${definicion}`)
      console.log(`✅  Migración: columna profesores.${columna} añadida`)
    }
  }

  // ── Tabla: aulas ──────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS aulas (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      centro_id   INTEGER NOT NULL REFERENCES centros(id) ON DELETE CASCADE,
      nombre      TEXT    NOT NULL,
      tipo        TEXT    NOT NULL,
      capacidad   INTEGER NOT NULL DEFAULT 30,
      created_at  TEXT    DEFAULT (datetime('now'))
    )
  `)

  // ── Tabla: reservas ───────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS reservas (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      centro_id    INTEGER NOT NULL REFERENCES centros(id) ON DELETE CASCADE,
      aula_id      INTEGER NOT NULL REFERENCES aulas(id)      ON DELETE CASCADE,
      profesor_id  INTEGER NOT NULL REFERENCES profesores(id) ON DELETE CASCADE,
      asignatura   TEXT    NOT NULL,
      fecha        TEXT    NOT NULL,
      franja_id    TEXT    NOT NULL DEFAULT '',
      franja_label TEXT    NOT NULL DEFAULT '',
      franja_orden INTEGER NOT NULL DEFAULT 0,
      hora_inicio  TEXT    NOT NULL DEFAULT '',
      hora_fin     TEXT    NOT NULL DEFAULT '',
      created_at   TEXT    DEFAULT (datetime('now'))
    )
  `)

  // ── Tabla: contactos ──────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS contactos (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      profesor_id  INTEGER NOT NULL REFERENCES profesores(id) ON DELETE CASCADE,
      contacto_id  INTEGER NOT NULL REFERENCES profesores(id) ON DELETE CASCADE,
      UNIQUE(profesor_id, contacto_id)
    )
  `)

  // ── Tabla: mensajes ───────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS mensajes (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      de_id       INTEGER NOT NULL REFERENCES profesores(id) ON DELETE CASCADE,
      para_id     INTEGER NOT NULL REFERENCES profesores(id) ON DELETE CASCADE,
      texto       TEXT    NOT NULL,
      created_at  TEXT    DEFAULT (datetime('now'))
    )
  `)

  // ── Tabla: salidas_bano ───────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS salidas_bano (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      centro_id      INTEGER NOT NULL REFERENCES centros(id) ON DELETE CASCADE,
      profesor_id    INTEGER NOT NULL REFERENCES profesores(id) ON DELETE CASCADE,
      alumno_nombre  TEXT    NOT NULL,
      alumno_curso   TEXT    NOT NULL,
      fecha          TEXT    NOT NULL,
      hora           TEXT    NOT NULL,
      created_at     TEXT    DEFAULT (datetime('now'))
    )
  `)

  // ── Tabla: alumnos ───────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS alumnos (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      centro_id   INTEGER NOT NULL REFERENCES centros(id) ON DELETE CASCADE,
      apellidos   TEXT    NOT NULL,
      nombre      TEXT    NOT NULL,
      curso       TEXT    NOT NULL,
      grupo       TEXT    NOT NULL,
      created_at  TEXT    DEFAULT (datetime('now'))
    )
  `)

  // ── Tabla: guardias ──────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS guardias (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      centro_id     INTEGER NOT NULL REFERENCES centros(id) ON DELETE CASCADE,
      profesor_id   INTEGER NOT NULL REFERENCES profesores(id) ON DELETE CASCADE,
      fecha         TEXT    NOT NULL,
      franja_id     TEXT    NOT NULL,
      franja_label  TEXT    NOT NULL,
      franja_orden  INTEGER NOT NULL DEFAULT 0,
      hora_inicio   TEXT    NOT NULL DEFAULT '',
      hora_fin      TEXT    NOT NULL DEFAULT '',
      curso         TEXT    NOT NULL,
      grupo         TEXT    NOT NULL,
      aula          TEXT    NOT NULL,
      instrucciones TEXT    NOT NULL DEFAULT '',
      cubierta_por  INTEGER REFERENCES profesores(id) ON DELETE SET NULL,
      created_at    TEXT    DEFAULT (datetime('now'))
    )
  `)

  // ── Tabla: franjas_centro ─────────────────────────────
  // Horario configurable por centro (sustituye a la lista fija que
  // antes vivía sólo en el frontend, frontend/src/config/franjas.js)
  db.exec(`
    CREATE TABLE IF NOT EXISTS franjas_centro (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      centro_id    INTEGER NOT NULL REFERENCES centros(id) ON DELETE CASCADE,
      orden        INTEGER NOT NULL DEFAULT 0,
      label        TEXT    NOT NULL,
      hora_inicio  TEXT    NOT NULL,
      hora_fin     TEXT    NOT NULL,
      reservable   INTEGER NOT NULL DEFAULT 1,
      created_at   TEXT    DEFAULT (datetime('now'))
    )
  `)

  // Centros sin horario configurado (instalaciones existentes, o creados
  // antes de que esta tabla existiera) se quedan sin franjas y por tanto
  // sin poder reservar aulas ni programar guardias. Se les da un horario
  // por defecto (el mismo que antes era fijo para todos los centros).
  const centrosSinFranjas = db.prepare(`
    SELECT id FROM centros
    WHERE id NOT IN (SELECT DISTINCT centro_id FROM franjas_centro)
  `).all()
  if (centrosSinFranjas.length > 0) {
    for (const centro of centrosSinFranjas) sembrarFranjasPorDefecto(db, centro.id)
    console.log(`✅  Migración: horario por defecto creado para ${centrosSinFranjas.length} centro(s)`)
  }

  // ── Tabla: password_resets ───────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      profesor_id INTEGER NOT NULL REFERENCES profesores(id) ON DELETE CASCADE,
      token       TEXT    NOT NULL UNIQUE,
      expires_at  TEXT    NOT NULL,
      used        INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT    DEFAULT (datetime('now'))
    )
  `)

  // ── Tabla: notificaciones ────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS notificaciones (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      centro_id   INTEGER REFERENCES centros(id) ON DELETE CASCADE,
      profesor_id INTEGER NOT NULL REFERENCES profesores(id) ON DELETE CASCADE,
      tipo        TEXT    NOT NULL,
      titulo      TEXT    NOT NULL,
      mensaje     TEXT    NOT NULL,
      leida       INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT    DEFAULT (datetime('now'))
    )
  `)

  // ── Seed: superadmin ─────────────────────────────────
  const superadmin = db.prepare("SELECT id FROM profesores WHERE rol = 'superadmin'").get()
  if (!superadmin) {
    const hash = bcrypt.hashSync('superadmin1234', 10)
    db.prepare(`
      INSERT INTO profesores (centro_id, nombre, apellidos, email, password, asignatura, rol, aprobado)
      VALUES (NULL, 'Super', 'Admin', 'admin@edurooms.es', ?, 'Sistema', 'superadmin', 1)
    `).run(hash)
    console.log('✅  Superadmin creado — admin@edurooms.es / superadmin1234')
  }

  console.log('✅  Base de datos lista en', DB_PATH)
}

module.exports = { getDB, initDB, sembrarFranjasPorDefecto }