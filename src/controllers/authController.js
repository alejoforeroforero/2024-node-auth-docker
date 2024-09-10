const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");

async function register(req, res) {
  const { email, password } = req.body;
  try {
    const hashedPassword = await argon2.hash(password);
    const result = await pool.query(
      "INSERT INTO usuarios (email, password) VALUES ($1, $2) RETURNING id",
      [email, hashedPassword]
    );
    res.status(201).json({
      message:
        "Usuario registrado exitosamente, ya puedes hacer login en la applicación",
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).json({
      error: "Error al registrar usuario, es probable que el \n"+
          "usuario ya exista en nuestra base de datos",
    });
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [
      email,
    ]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      if (await argon2.verify(user.password, password)) {
        const accessToken = generateAccessToken(user);
        const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);

        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          sameSite: "strict",
          // secure: true // Habilitar en producción con HTTPS
        });

        const userInfo = {
          first_name: user.first_name,
          email: user.email,
        };

        res.status(200).json({ userInfo, accessToken });
      } else {
        res.status(400).json({ error: "Contraseña incorrecta" });
      }
    } else {
      res.status(400).json({ error: "Usuario no encontrado" });
    }
  } catch (error) {
    console.error("Error en el login:", error);
    res.status(500).json({ error: "Error en el login" });
  }
}

function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "30s" }
  );
}

function refreshAccessToken(req, res, next) {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token" });
  }

  try {
    const user = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Generar un nuevo access token
    const accessToken = generateAccessToken(user);

    const userInfo = {
      email: user.email,
    };

    res.json({ userInfo, accessToken });
  } catch (error) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
}

function refreshToken(req, res) {
  console.log("entra a refreshToken");
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken == null) return res.sendStatus(401);

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken({ id: user.id, email: user.email });
    res.json({ accessToken });
  });
}

function logout(req, res) {
  res.clearCookie("refreshToken");
  res.json({ message: "Logout exitoso" });
}

async function getUsers(req, res) {
  try {
    const result = await pool.query(
      "SELECT id, email, first_name FROM usuarios"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
}

const verifyAuth = (req, res) => {
  // Si llegamos aquí, significa que el token es válido (gracias al middleware authenticateToken)
  console.log("llega hasta aca");
  res.json({
    message: "Authenticated",
    user: req.user,
  });
};

async function updateUser(req, res) {
  const { email, ...updateFields } = req.body;

  try {
    const result = await pool.query(
      "UPDATE usuarios SET " +
        Object.keys(updateFields)
          .map((key, i) => `${key} = $${i + 2}`)
          .join(", ") +
        " WHERE email = $1 RETURNING *",
      [email, ...Object.values(updateFields)]
    );

    if (result.rows.length > 0) {
      const updatedUser = result.rows[0];
      res.json({ msg: "User updated", user: updatedUser });
    } else {
      res.status(404).json({ error: "Usuario no encontrado" });
    }
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
}

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getUsers,
  verifyAuth,
  refreshAccessToken,
  updateUser,
};
