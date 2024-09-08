const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

async function register(req, res) {
  const { email, password } = req.body;
  try {
    const hashedPassword = await argon2.hash(password);
    const result = await pool.query(
      'INSERT INTO usuarios (email, password) VALUES ($1, $2) RETURNING id',
      [email, hashedPassword]
    );
    res.status(201).json({ message: 'Usuario registrado exitosamente', userId: result.rows[0].id });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      if (await argon2.verify(user.password, password)) {
        const accessToken = generateAccessToken(user);
        const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
        
        res.cookie('refreshToken', refreshToken, { 
          httpOnly: true, 
          sameSite: 'strict',
          // secure: true // Habilitar en producción con HTTPS
        });
        
        res.json({ accessToken });
      } else {
        res.status(400).json({ error: 'Contraseña incorrecta' });
      }
    } else {
      res.status(400).json({ error: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ error: 'Error en el login' });
  }
}

function generateAccessToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
}

function refreshToken(req, res) {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken == null) return res.sendStatus(401);
  
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken({ id: user.id, email: user.email });
    res.json({ accessToken });
  });
}

function logout(req, res) {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logout exitoso' });
}

async function getUsers(req, res) {
  try {
    const result = await pool.query('SELECT id, email FROM usuarios');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
}

module.exports = { register, login, refreshToken, logout, getUsers };