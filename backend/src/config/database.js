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

// Nota sobre las PKs: en SQLite `INTEGER PRIMARY KEY` ya es un alias del
// ROWID y autoincrementa solo. `AUTOINCREMENT` añade la tabla interna
// sqlite_sequence y una comprobación extra en cada INSERT sólo para
// garantizar que un id borrado nunca se reutiliza — algo que aquí no hace
// falta, así que se evita ese coste y se usa `INTEGER PRIMARY KEY` a secas.
const TABLAS = {
  centros: `
    CREATE TABLE IF NOT EXISTS centros (
      id                   INTEGER PRIMARY KEY,
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
  `,
  profesores: `
    CREATE TABLE IF NOT EXISTS profesores (
      id          INTEGER PRIMARY KEY,
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
  `,
  aulas: `
    CREATE TABLE IF NOT EXISTS aulas (
      id          INTEGER PRIMARY KEY,
      centro_id   INTEGER NOT NULL REFERENCES centros(id) ON DELETE CASCADE,
      nombre      TEXT    NOT NULL,
      tipo        TEXT    NOT NULL,
      capacidad   INTEGER NOT NULL DEFAULT 30,
      created_at  TEXT    DEFAULT (datetime('now'))
    )
  `,
  reservas: `
    CREATE TABLE IF NOT EXISTS reservas (
      id           INTEGER PRIMARY KEY,
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
  `,
  contactos: `
    CREATE TABLE IF NOT EXISTS contactos (
      id           INTEGER PRIMARY KEY,
      profesor_id  INTEGER NOT NULL REFERENCES profesores(id) ON DELETE CASCADE,
      contacto_id  INTEGER NOT NULL REFERENCES profesores(id) ON DELETE CASCADE,
      UNIQUE(profesor_id, contacto_id)
    )
  `,
  mensajes: `
    CREATE TABLE IF NOT EXISTS mensajes (
      id          INTEGER PRIMARY KEY,
      de_id       INTEGER NOT NULL REFERENCES profesores(id) ON DELETE CASCADE,
      para_id     INTEGER NOT NULL REFERENCES profesores(id) ON DELETE CASCADE,
      texto       TEXT    NOT NULL,
      created_at  TEXT    DEFAULT (datetime('now'))
    )
  `,
  salidas_bano: `
    CREATE TABLE IF NOT EXISTS salidas_bano (
      id             INTEGER PRIMARY KEY,
      centro_id      INTEGER NOT NULL REFERENCES centros(id) ON DELETE CASCADE,
      profesor_id    INTEGER NOT NULL REFERENCES profesores(id) ON DELETE CASCADE,
      alumno_nombre  TEXT    NOT NULL,
      alumno_curso   TEXT    NOT NULL,
      fecha          TEXT    NOT NULL,
      hora           TEXT    NOT NULL,
      created_at     TEXT    DEFAULT (datetime('now'))
    )
  `,
  alumnos: `
    CREATE TABLE IF NOT EXISTS alumnos (
      id          INTEGER PRIMARY KEY,
      centro_id   INTEGER NOT NULL REFERENCES centros(id) ON DELETE CASCADE,
      apellidos   TEXT    NOT NULL,
      nombre      TEXT    NOT NULL,
      curso       TEXT    NOT NULL,
      grupo       TEXT    NOT NULL,
      created_at  TEXT    DEFAULT (datetime('now'))
    )
  `,
  guardias: `
    CREATE TABLE IF NOT EXISTS guardias (
      id            INTEGER PRIMARY KEY,
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
  `,
  // Horario configurable por centro (sustituye a la lista fija que antes
  // vivía sólo en el frontend, frontend/src/config/franjas.js)
  franjas_centro: `
    CREATE TABLE IF NOT EXISTS franjas_centro (
      id           INTEGER PRIMARY KEY,
      centro_id    INTEGER NOT NULL REFERENCES centros(id) ON DELETE CASCADE,
      orden        INTEGER NOT NULL DEFAULT 0,
      label        TEXT    NOT NULL,
      hora_inicio  TEXT    NOT NULL,
      hora_fin     TEXT    NOT NULL,
      reservable   INTEGER NOT NULL DEFAULT 1,
      created_at   TEXT    DEFAULT (datetime('now'))
    )
  `,
  password_resets: `
    CREATE TABLE IF NOT EXISTS password_resets (
      id          INTEGER PRIMARY KEY,
      profesor_id INTEGER NOT NULL REFERENCES profesores(id) ON DELETE CASCADE,
      token       TEXT    NOT NULL UNIQUE,
      expires_at  TEXT    NOT NULL,
      used        INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT    DEFAULT (datetime('now'))
    )
  `,
  notificaciones: `
    CREATE TABLE IF NOT EXISTS notificaciones (
      id          INTEGER PRIMARY KEY,
      centro_id   INTEGER REFERENCES centros(id) ON DELETE CASCADE,
      profesor_id INTEGER NOT NULL REFERENCES profesores(id) ON DELETE CASCADE,
      tipo        TEXT    NOT NULL,
      titulo      TEXT    NOT NULL,
      mensaje     TEXT    NOT NULL,
      leida       INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT    DEFAULT (datetime('now'))
    )
  `,
}

// Índices sobre todas las columnas FK: sin ellos, cada JOIN/filtro por
// centro_id, profesor_id, etc. es un table scan completo.
const INDICES_FK = [
  ['idx_centros_traspaso_destino_id',  'centros',         'traspaso_destino_id'],
  ['idx_profesores_centro_id',         'profesores',      'centro_id'],
  ['idx_aulas_centro_id',              'aulas',           'centro_id'],
  ['idx_reservas_centro_id',           'reservas',        'centro_id'],
  ['idx_reservas_aula_id',             'reservas',        'aula_id'],
  ['idx_reservas_profesor_id',         'reservas',        'profesor_id'],
  ['idx_contactos_profesor_id',        'contactos',       'profesor_id'],
  ['idx_contactos_contacto_id',        'contactos',       'contacto_id'],
  ['idx_mensajes_de_id',               'mensajes',        'de_id'],
  ['idx_mensajes_para_id',             'mensajes',        'para_id'],
  ['idx_salidas_bano_centro_id',       'salidas_bano',    'centro_id'],
  ['idx_salidas_bano_profesor_id',     'salidas_bano',    'profesor_id'],
  ['idx_alumnos_centro_id',            'alumnos',         'centro_id'],
  ['idx_guardias_centro_id',           'guardias',        'centro_id'],
  ['idx_guardias_profesor_id',         'guardias',        'profesor_id'],
  ['idx_guardias_cubierta_por',        'guardias',        'cubierta_por'],
  ['idx_franjas_centro_centro_id',     'franjas_centro',  'centro_id'],
  ['idx_password_resets_profesor_id',  'password_resets', 'profesor_id'],
  ['idx_notificaciones_centro_id',     'notificaciones',  'centro_id'],
  ['idx_notificaciones_profesor_id',   'notificaciones',  'profesor_id'],
]

// Quita AUTOINCREMENT de las tablas que ya lo tienen (ALTER TABLE no puede
// hacerlo directamente en SQLite: hay que recrear la tabla). Se hace en
// cuatro fases separadas —renombrar todas, crear todas, copiar todas,
// borrar todas— en vez de tabla a tabla, porque `ALTER TABLE RENAME TO`
// reescribe automáticamente las FKs de otras tablas que ya apunten a la
// tabla renombrada; si se procesara una tabla completa (rename+create) antes
// de renombrar las demás, esa reescritura corrompería la FK recién creada
// para que apunte al nombre temporal en vez de al nombre final.
function migrarAutoincrement(db) {
  const tablasConAutoincrement = Object.entries(TABLAS).filter(([nombre]) => {
    const actual = db.prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name=?`).get(nombre)
    return actual && /AUTOINCREMENT/i.test(actual.sql)
  })
  if (tablasConAutoincrement.length === 0) return

  // El cambio de la pragma foreign_keys no tiene efecto dentro de una
  // transacción, así que se desactiva fuera de ella antes de recrear tablas.
  db.pragma('foreign_keys = OFF')
  const ejecutar = db.transaction(() => {
    // Fase 1: capturar las columnas y renombrar todas las tablas afectadas.
    const columnasPorTabla = new Map()
    for (const [nombre] of tablasConAutoincrement) {
      columnasPorTabla.set(nombre, db.prepare(`PRAGMA table_info(${nombre})`).all().map(c => c.name).join(', '))
      db.exec(`ALTER TABLE ${nombre} RENAME TO ${nombre}__old_autoincrement`)
    }
    // Fase 2: crear todas las tablas nuevas (ya sin AUTOINCREMENT).
    for (const [, createSql] of tablasConAutoincrement) db.exec(createSql)
    // Fase 3: copiar los datos preservando los ids existentes.
    for (const [nombre] of tablasConAutoincrement) {
      const columnas = columnasPorTabla.get(nombre)
      db.exec(`INSERT INTO ${nombre} (${columnas}) SELECT ${columnas} FROM ${nombre}__old_autoincrement`)
    }
    // Fase 4: borrar las tablas temporales.
    for (const [nombre] of tablasConAutoincrement) db.exec(`DROP TABLE ${nombre}__old_autoincrement`)
  })
  ejecutar()
  db.pragma('foreign_keys = ON')

  const violaciones = db.prepare('PRAGMA foreign_key_check').all()
  if (violaciones.length > 0) {
    console.error('⚠️  Violaciones de integridad referencial tras quitar AUTOINCREMENT:', violaciones)
  } else {
    console.log(`✅  Migración: AUTOINCREMENT eliminado de ${tablasConAutoincrement.length} tabla(s)`)
  }
}

function initDB() {
  const db = getDB()
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  for (const createSql of Object.values(TABLAS)) db.exec(createSql)

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

  migrarAutoincrement(db)

  for (const [indice, tabla, columna] of INDICES_FK) {
    db.exec(`CREATE INDEX IF NOT EXISTS ${indice} ON ${tabla}(${columna})`)
  }

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
