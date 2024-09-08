const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const { Pool } = require("pg");

const authRoutes = require("./routes/authRoutes");

const app = express();
const port = process.env.PORT || 3000;

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

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

// Exportar el pool para usarlo en otros archivos
module.exports = { pool };