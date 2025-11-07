import express from "express";
import cors from "cors";
import "./db/db.js"; // conexión a MongoDB
import productosRouter from "./routes/productos.routes.js";
import usersRouter from "./routes/user.routes.js"; 

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Bienvenido al curso de Node + Express");
});

// Rutas principales
app.use("/api/productos", productosRouter);
app.use("/api/users", usersRouter); 

// Servidor
const PORT = 8081;
app.listen(PORT, () =>
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
);
