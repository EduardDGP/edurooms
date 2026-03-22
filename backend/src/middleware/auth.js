const jwt = require('jsonwebtoken')

const SECRET = process.env.JWT_SECRET || 'edurooms_secret_local_2024'

function generarToken(profesor) {
  return jwt.sign(
    { id: profesor.id, email: profesor.email, rol: profesor.rol },
    SECRET,
    { expiresIn: '7d' }
  )
}

function verificarToken(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' })
  }

  const token = header.split(' ')[1]
  try {
    const payload = jwt.verify(token, SECRET)
    req.profesorId = payload.id
    req.rol        = payload.rol
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' })
  }
}

function soloDirector(req, res, next) {
  if (req.rol !== 'director')
    return res.status(403).json({ error: 'Acceso restringido al director' })
  next()
}

module.exports = { generarToken, verificarToken, soloDirector }