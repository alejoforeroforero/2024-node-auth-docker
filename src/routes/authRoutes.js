const express = require("express");
const router = express.Router();
const {
  register,
  login,
  refreshToken,
  logout,
  getUsers,
  verifyAuth,
  refreshAccessToken,
  updateUser
} = require("../controllers/authController");
const { authenticateToken} = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.post("/token", refreshToken);
router.post("/logout", logout);

router.get("/info", getUsers);

router.get("/refresh-token", refreshAccessToken);

router.get("/verify-auth", authenticateToken, verifyAuth);
router.put("/update-user", authenticateToken, updateUser);

// Ruta protegida de ejemplo
router.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: "Esta es una ruta protegida", user: req.user });
});

module.exports = router;
