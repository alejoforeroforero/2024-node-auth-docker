const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const refreshToken = req.cookies.refreshToken;
  
  if (!token) {
    return res.status(401).json({ message: 'No se proporcionó token de acceso' });
  }
  
  try {
    const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
    // Verificar el refresh token
    if (!refreshToken) {
      return res.status(401).json({ message: 'No se proporcionó refresh token' });
    }
    
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, refreshUser) => {
      if (err || user.id !== refreshUser.id) {
        return res.status(403).json({ message: 'Refresh token inválido' });
      }
      
      req.user = user;
      next();
    });
  } catch (error) {
    return res.status(403).json({ message: 'Token de acceso inválido o expirado' });
  }
}

module.exports = { authenticateToken };
