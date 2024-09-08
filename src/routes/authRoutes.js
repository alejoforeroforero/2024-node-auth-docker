const express = require("express");
const router = express.Router();
const {
  register,
  login,
  refreshToken,
  logout,
  getUsers,
} = require("../controllers/authController");
const { authenticateToken } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.post("/token", refreshToken);
router.post("/logout", logout);

router.get("/info", getUsers);

// Ruta protegida de ejemplo
router.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: "Esta es una ruta protegida", user: req.user });
});

module.exports = router;
