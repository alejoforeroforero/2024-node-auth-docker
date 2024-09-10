const express = require("express");
const cors = require('cors');
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const { Pool } = require("pg");

const authRoutes = require("./routes/authRoutes");

const app = express();
const port = process.env.PORT || 3000;

app.set("trust proxy", 1);

// Configuración de la base de datos
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Middleware
app.use(bodyParser.json());
app.use(cookieParser());

app.use(cors({
  origin: [process.env.HOST1, process.env.HOST2],
  credentials: true
}));

// Rutas
app.use("/auth", authRoutes);

// Prueba de conexión a la base de datos
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Error conectando a la base de datos", err);
  } else {
    console.log("Conexión exitosa a la base de datos");
    console.log("Tiempo actual del servidor:", res.rows[0].now);
  }
  // No cerramos el pool aquí para que esté disponible para las rutas
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Manejo de excepciones no capturadas
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  // Aplicación específica: decidir si cerrar el servidor en este caso
});

process.on("SIGTERM", () => {
  console.info("SIGTERM signal received.");
  console.log("Closing http server.");
  server.close(() => {
    console.log("Http server closed.");
    // Cerrar conexiones de base de datos, etc.
    pool.end(() => {
      console.log("Database connections closed.");
      process.exit(0);
    });
  });
});

// Iniciar el servidor

app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
});

// Exportar el pool para usarlo en otros archivos
module.exports = { pool };
