import express from "express";
import cors from "cors";
import "./db/db.js"; // conexión a MongoDB
import productosRouter from "./routes/productos.routes.js";
import usersRouter from "./routes/user.routes.js";
import loginRouter from "./routes/login.routes.js";

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

// Servidor
const PORT = 8081;
app.listen(PORT, () =>
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
);
