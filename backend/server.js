import dotenv from 'dotenv';
dotenv.config();

console.log('=== VERIFICANDO VARIABLES DE ENTORNO ===');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('=========================================');

import express from "express";
import cors from "cors";
import "./db/db.js";
import productosRouter from "./routes/productos.routes.js";
import usersRouter from "./routes/user.routes.js";
import loginRouter from "./routes/login.routes.js";
import checkoutRouter from "./routes/checkout.routes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Bienvenido al curso de Node + Express");
});

// Rutas API
app.use("/api/productos", productosRouter);
app.use("/api/users", usersRouter);
app.use("/api/login", loginRouter);
app.use("/api/checkout", checkoutRouter);

// Servidor
const PORT = 8081;
app.listen(PORT, () =>
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
);
