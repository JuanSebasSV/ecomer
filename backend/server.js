import express from "express";
import cors from "cors";
import "./db/db.js"; // conexión a MongoDB
import productosRouter from "./routes/productos.routes.js"; 

const app = express();

// Middleware
app.use(cors());          // habilita CORS
app.use(express.json());   // permite leer JSON en req.body

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Bienvenido al curso de Node + Express");
});

// Montar router de productos
app.use("/api/productos", productosRouter);

// Servidor
const PORT = 8081;
app.listen(PORT, () =>
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
);
